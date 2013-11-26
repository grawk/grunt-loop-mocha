# grunt-loop-mocha

A simple wrapper for running multiple mocha instances from a single grunt task target.

## Abilities

1. run mocha multiple times from a single target
2. pass through additional UPPERCASE command line args, for use by other aspects of the application under test

I wrote this module to facilitate selenium webdriver testing. For that, each mocha run is a different browser target (specified in the iterations object of the config). My selenium test scripts 
use the passed-through variables to configure the test runs. Perhaps you'll find it useful for this or other purposes.

## Example usage

Below is the config block for this task from gruntfile.js

```javascript
/* ... */
loopmocha: {
      all: {
        src: ["test/*.js"],
        options: {
          iterations: [{
              "description": "slow-iteration",
              "timeout": 15000,
              "ITERATION_VALUE": "foo"
            }, {
              "description": "medium-iteration",
              "timeout": 8000,
              "ITERATION_VALUE": "bar",
              "SOME_OTHER_KEY": "some other value"
            }, {
              "description": "override-YET_ANOTHER_KEY",
              "ITERATION_VALUE": "boo",
              "YET_ANOTHER_KEY": "still yet another value"
            }
          ],
          parallel: false,
          globals: ['should'],
          timeout: 3000,
          ui: 'bdd',
          reporter: "xunit-file",
          reportLocation: "test/report",
          "YET_ANOTHER_KEY": "yet another value"
        }
      }
    },
/* ... */

grunt.registerTask('test', 'loopmocha');
```

### lowercase options

any supported mocha command line argument is accepted here. In addition to those mocha specific arguments, the following lowercase options are specifically for configuring this task, and won't be passed along to the mocha process:

* parallel (optional: defaults to false): If true, mocha iterations will run in parallel via async.forEach. If false, mocha iterations will run in series via async.forEachSeries
* reportLocation (required if using xunit-file reporter): specify where xunit report files should be written. Note: if you are using "xunit-file" as your reporter, you need to add it to your package.json
* description (optional): put this within your iteration objects in order to better label your console output or xunit report file

### uppercase options

Uppercase options are not meant to pass any instructions to the mocha test process. They are meant to be used within your tests themselves for any purpose you see fit. E.g. perhaps you want to use the passed through "ITERATION_VALUE" variable for some switching inside your test.

### dealing with failures

If any mocha process in your iterations exits with a non-zero value, it will not stop the subsequent iterations from running. After all iterations have attempted to run, the overall grunt-loop-mocha task will exit with an error or not based on whether any of the inner iterations had an error. If there was an error, you will see a message which should indicate which of your iterations caused the failure.