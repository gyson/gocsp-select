var co = require('gocsp-co')
var select = require('gocsp-select')

co(function* () {
    yield select(s => s
        .take(chan_0, function (obj) {
            // default: identity
        })
        .put(chan_1, val, function (ok) {
            // default: identity
        })
        .wait(thunk_or_promise, function (err, data) {
            // default: forward
        })
        .once(event, type, function (a, b, c) {
            // default: identity
        })
        .timeout(1000, function () {
            // default: timeout error
        })
    )
})()

co(function* () {
    yield select(s => s
        .take(chan_0)
        .take(chan_1)
        .take(chan_2)
        .take(chan_3)
    )
})
