# grunt-loop-mocha Changes

## v1.2.1

* **Enhancement** remove manual directory creation for the xunit-file case since xunit-file now handles that internally

## v1.2.0

* **New feature** adding configurable option for path to mocha binary
* **New feature** better formatting for console output

## v1.1.0

**Bug fix** Fixes #24. Minor release bump since this bug fix does represent a change in behavior. Though presumably nobody was relying
on the buggy behavior. It just took some time to find this edge case due to the lack of a comprehensive unit test suite.

## v1.0.0

**Breaking change** moving all non-mocha options out of "mocha" config namespace (e.g. reportLocation). Adding "loop" namespace for such options.
See https://github.com/grawk/grunt-loop-mocha/blob/master/README.md#loop-options for more details

**New feature** parallelism by file or directory in addition to parallelism by iterations. See [parallel option](https://github.com/grawk/grunt-loop-mocha/blob/1.0.development/README.md#loop-options)

## v0.3.0

* Change structure of JSON config to namespace the mocha options, and namespace additional values as siblings to the mocha/iterations objects
* Pass-through variables no longer set via argv on the command line. Instead, per the additional namespaces on the options object, stringified JSON environment variables will be set

## v0.2.6

* Export iteration label as a command line arg for use in mocha tests

## v0.2.5

* Modify parallel flag handling such that options.parallel === undefined will not cause an exception

## v0.2.4

* Modify parallel flag handling such that Boolean true as well as any string version of "true" will evaluate to "true". Allows flag to be passed in via command line arg

## v0.2.3

* Modify noFail flag handling such that Boolean true as well as any string version of "true" will evaluate to "true". Allows flag to be passed in via command line arg

## v0.2.2

* Adding noFail option to prevent mocha from returning non-zero to the parent shell process. Allows a continuous integration build to determine success/failure based on xunit output

## v0.2.1

* Adding parallel mocha run option. Set "parallel": true in your Gruntfile config. Value will default to false. Results in use of "async.forEach" versus "async.forEachSeries" to execute mocha.