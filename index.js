
'use strict'

module.exports = select

var co = require('gocsp-co')
var thunk = require('gocsp-thunk')

function select(fn) {
    return thunk(function (cb) {
        var selector = new Selector(cb)
        try {
            fn.call(selector, selector)
        } catch (e) {
            if (!selector._selected) {
                cleanup(selector)
                throw e
            }
        }
    })
}

function cleanup(selector) {
    selector._selected = true
    selector._cancels.forEach(function (cancel) {
        cancel()
    })
    selector._cancels = null
    selector._channels = null
}

function Selector(callback) {
    this._selected = false
    this._cancels = []
    this._channels = new WeakSet() // use WeakSet or [] ?

    var self = this
    thunk(function (cb) {
        self._cb = cb
    })(function (fn, args, ctx) {
        if (self._selected) { return }
        cleanup(self)
        try {
            if (co.isGenFun(fn)) {
                co(fn).apply(ctx, args)(callback)
            } else {
                callback(null, fn.apply(ctx, args))
            }
        } catch (err) {
            callback(err)
        }
    })
}

/*
    No duplicate channel allowed
*/
function assertNoDuplicateChannel(selector, chan) {
    if (selector._channels.has(chan)) {
        throw new Error('Cannot have duplicated channel')
    }
    selector._channels.add(chan)
}


function defaultTake(obj) {
    return obj
}

// .take(chan, fn)
Selector.prototype.take = function (chan, fn) {
    if (this._selected) { return }
    var self = this

    assertNoDuplicateChannel(self, chan)

    var item = chan.take(function (data) {
        self._cb(fn || defaultTake, [data])
    })

    if (!self._selected) {
        self._cancels.push(function () {
            chan.cancel(item)
        })
    }

    return this
}

function defaultPut(ok) {
    return ok
}

// .put(chan, value, fn)
// if it return a promise / function (co)
Selector.prototype.put = function (chan, value, fn) {
    if (this._selected) { return }
    var self = this

    assertNoDuplicateChannel(self, chan)

    var item = chan.put(value, function (ok) {
        self._cb(fn || defaultPut, [ok])
    })

    if (!self._selected) {
        self._cancels.push(function () {
            chan.cancel(item)
        })
    }

    return this
}

function defaultWait (err, val) {
    if (err) {
        throw err
    } else {
        return val
    }
}

// .wait(thunk/promise, cb)
// thunk / callback / promise
Selector.prototype.wait =
Selector.prototype.await = function (object, fn) {
    if (this._selected) { return }

    var self = this

    // wrap it as thunk if it's promise
    if (object && typeof object.then === 'function') {
        object = thunk.from(object)
    }

    // it's thunk or callback
    if (typeof object === 'function') {
        if (!thunk.isThunk(object)) {
            // wrap it if it's just callback for safety
            object = thunk(object)
        }
        // handle thunk here
        object(function () {
            self._cb(fn || defaultWait, arguments)
        })

        return this
    }

    throw new TypeError('invalid type to wait')
}

function defaultOnce() {} // noop

// .once(event, 'data', data => { ... })
Selector.prototype.once = function (event, type, fn) {
    if (this._selected) { return }

    var self = this
    function listener() {
        self._cb(fn || defaultOnce, arguments, this)
    }
    this._cancels.push(function () {
        event.removeListener(listener)
    })
    event.on(type, listener)

    return this
}

function defaultTimeout() {
    throw new Error('Timeout!')
}

Selector.prototype.timeout = function (time, fn) {
    if (this._selected) { return }

    var self = this
    setTimeout(function () {
        self._cb(fn || defaultTimeout)
    }, time)

    return this
}
