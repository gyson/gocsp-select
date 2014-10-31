co = require 'gocsp-co'
select = require 'gocsp-select'

# probably need latest coffee (1.8.* or 1.9.* ?) for generator syntax
do co ->
  yield select ->
    @take chan_0, (obj) ->
      # default: identity
      # do something
    @put chan_1, val, (ok) ->
      # default: identity
      # do something
    @wait thunk_or_promise, (err, data) ->
      # default: forward
      # do something
    @once event, type, (a, b, c) ->
      # default: identity
      # do something
    @timeout 1000, ->
      # default: timeout error
      # do something
