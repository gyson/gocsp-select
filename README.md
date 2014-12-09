
# gocsp-select

select from multiple channels, thunks, promises, events, etc

## Example

```js
var go = require('gocsp-go')
var select = require('gocsp-select')
var timeout = require('gocsp-timeout')
var Channel = require('gocsp-channel')

var chan1 = new Channel()
var chan2 = new Channel()

go(function* () {
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
})
```

## License

MIT
