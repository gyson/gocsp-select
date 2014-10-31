
var assert = require('assert')

var select = require('..')
var co = require('gocsp-co')
var Channel = require('gocsp-channel')

var chan_0 = new Channel()
var chan_1 = new Channel()
var chan_2 = new Channel()
var chan_3 = new Channel()

describe('select()', function () {

    it('should be fine', function (done) {
        co(function* () {

            chan_2.put(2)

            var obj = yield select(function(){this
                .take(chan_0)
                .take(chan_1)
                .take(chan_2)
                .take(chan_3)
            })

            assert(obj === 2)

            chan_3.put(3)

            var obj = yield select(function(){this
                .take(chan_0)
                .take(chan_1)
                .take(chan_2)
                .take(chan_3)
            })
            assert(obj === 3)

            done()
        })()
    })

})
