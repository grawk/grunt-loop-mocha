# grunt-loop-mocha

A simple wrapper for running multiple mocha instances from a single grunt task target.

## Abilities

1. run mocha multiple times from a single target
2. set stringified JSON environment variables, customized for each mocha run

I wrote this module to facilitate selenium webdriver testing. For that, each mocha run is a different browser target
(specified in the iterations object of the config). My selenium test scripts
use stringified JSON environment variables to configure the test runs. Perhaps you'll find it useful for this or other purposes.

## Example usage

Below is the config block for this task from gruntfile.js

```javascript
/* ... */
loopmocha: {
	src: ["test/*.js"],
	options: {
		mocha: {
			parallel: true,
			globals: ['should'],
			timeout: 3000,
			ui: 'bdd',
			reporter: "xunit-file",
			reportLocation: "test/report"
		},
		env1: {
			stringVal: "fromfile"
		},
		env2: {
			jsonVal: {
				foo: {
					bar: {
						stringVal: "baz"
					}
				}
			}
		}
		iterations: [
			{
				"description": "first",
				"env1": {
					"someKey": "some value"
				}
			},
			{
				"description": "second",
				"env2": {
					"someOtherKey": "some other value"
				}
			},
			{
				"description": "third",
				"mocha": {
					"timeout": 4000
				}
			},
			{
				"description": "fifth",
				"env1": {
					"anotherKey": "BLERG"
				},
				"env2": {
					"yetAnotherKey": 123
				}

			}
		]
	}
}
/* ... */

grunt.registerTask('test', 'loopmocha');
```

### mocha options

any supported mocha command line argument is accepted here. In addition to those mocha specific arguments, the following lowercase options are specifically for configuring this task, and won't be passed along to the mocha process:

* parallel (optional: defaults to false): If true, mocha iterations will run in parallel via async.forEach. If false, mocha iterations will run in series via async.forEachSeries
* reportLocation (required if using xunit-file reporter): specify where xunit report files should be written. Note: if you are using "xunit-file" as your reporter, you need to add it to your package.json
* noFail (optional: defaults to false): If true, the task will exit as zero regardless of any mocha test failures

### iterations options
Array of JSON objects. mocha will loop for each item, using its properties for the mocha run
  * iterations[N].description (optional): put this within your iteration objects in order to better label your console output or xunit report file
  * iterations[N].mocha (optional): grunt-loop-mocha will merge this mocha object with the one in your root "options" namespace for this iteration's mocha run
  * iterations[N].<mocha process env variables>: grunt-loop-mocha will merge this mocha object with any of the same name it finds in your root "options" namespace


### mocha process environment variables
Additional sibling elements to mocha/iterations will be set as stringified JSON to an environment variable of the same name as the key

### mocha_bin option (optional: defaults to null)
String, path to mocha or 'mocha compatible' executable. This option allows to override default mocha