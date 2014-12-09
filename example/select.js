
var go = require('gocsp-go')
var select = require('..')
var timeout = require('gocsp-timeout')
var Channel = require('gocsp-channel')

var chan1 = new Channel()
var chan2 = new Channel()

go(function* () {
    for (var i = 0; i < 10; i++) {
        yield select(function (s) {
            s(chan2.take(), function () {
                console.log('from chan2')
            })
            ||
            s(chan1.take(), function () {
                console.log('from chan1')
            })
            ||
            s(timeout(1000), function () {
                console.log('timeout')
            })
        })
        console.log('okk')
    }
})

go(function* () {
    for (var i = 0; i < 10; i++) {
        // p('aaa')
        if (Math.random() > 0.5) {
            yield chan1.put(1)
        } else {
            yield chan2.put(2)
        }
        yield timeout(2000)
    }
    console.log(chan1._length)
    console.log(chan2._length)
})
