# grunt-loop-mocha Changes

## 0.2.1

* Adding parallel mocha run option. Set "parallel": true in your Gruntfile config. Value will default to false. Results in use of "async.forEach" versus "async.forEachSeries" to execute mocha.