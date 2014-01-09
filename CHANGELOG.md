# grunt-loop-mocha Changes

## v0.2.4

* Modify parallel flag handling such that Boolean true as well as any string version of "true" will evaluate to "true". Allows flag to be passed in via command line arg

## v0.2.3

* Modify noFail flag handling such that Boolean true as well as any string version of "true" will evaluate to "true". Allows flag to be passed in via command line arg

## v0.2.2

* Adding noFail option to prevent mocha from returning non-zero to the parent shell process. Allows a continuous integration build to determine success/failure based on xunit output

## v0.2.1

* Adding parallel mocha run option. Set "parallel": true in your Gruntfile config. Value will default to false. Results in use of "async.forEach" versus "async.forEachSeries" to execute mocha.