'use strict';

module.exports = exports = select

var go = require('gocsp-go')
var thunk = require('gocsp-thunk')

function select(f) {
    return thunk(function (done) {
        new Selector(done).init(f)
    })
}
exports.select = select

function Selector(done) {
    this.done = done
    this.selected = false
    this.cancels = []
    this.hasCancelError = false
    this.cancelError = null
}

Selector.prototype.init = function (f) {
    try {
        var self = this
        f(function s(obj, fn) {
            if (self.selected) {
                if (thunk.isThunk(obj) && obj('isCancellable')) {
                    try {
                        obj('cancel') // cancel thunk
                    } catch (e) {}    // swallow error if any
                }
                return self.selected
            }

            var t = thunk.toThunk(obj)

            t(function (err, val) {
                if (self.selected) { return }
                self.finish(err, val, fn)
            })

            if (!self.selected && t('isCancellable')) {
                self.cancels.push(t)
            }

            return self.selected
        })
    } catch (e) {
        self.finish(e)
    }
}

Selector.prototype.finish = function (err, val, fn) {
    if (this.selected) { return }
    this.selected = true

    for (var i = 0; i < this.cancels.length; i++) {
        try {
            this.cancels[i]('cancel')
        } catch (e) {
            this.hasCancelError = true
            this.cancelError = e
        }
    }
    if (this.hasCancelError) {
        this.done(this.cancelError)
        return
    }
    if (typeof fn !== 'function') {
        this.done(err, val)
        return
    }
    if (isGeneratorFunction(fn)) {
        go(fn(err, val))(this.done)
        return
    }
    try {
        this.done(null, fn(err, val))
    } catch (error) {
        this.done(error)
    }
}

function isGeneratorFunction(obj) {
    return obj && obj.constructor
        && obj.constructor.name === 'GeneratorFunction'
}
