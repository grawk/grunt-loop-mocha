# grunt-loop-mocha

A simple wrapper for running multiple mocha instances from a single grunt task target.

## Abilities

1. run mocha multiple times from a single target
2. store pass-through variables into a config file, for use by other aspects of the application under test

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
              "SOME_KEY": "some value"
            }, {
              "SOME_OTHER_KEY": "some other value"
            }, {
              "A_THIRD_KEY": "another value"
            }, {
              "A_FOURTH_KEY": "blah"
            }, {
              "A_FIFTH_KEY": "BLERG"
            }
          ],
          config: "test/conf.json",
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

For the options outside of the "iterations" object, any supported mocha command line argument is accepted here. In addition to those mocha specific arguments, the following lowercase options are specifically for configuring this task:

* config: specifies location of the config JSON file for storing pass through variables. Recommended to put this in test/functional/config/conf.json
* reportLocation: specify where xunit report files should be written. Note: if you are using "xunit-file" as your reporter, you need to add it to your package.json

### uppercase options

Any option starting with an uppercase letter will be written to the config JSON file. Those within the iterations object will be written before each respective mocha run. Those which are sibling to the iterations object will be written once for all iterations. 

Note: the JSON config is additive. If your successive runs don't reset an earlier variable, its key and value will persist. The JSON config will also live after the task runs. 