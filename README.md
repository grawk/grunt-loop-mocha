# grunt-loop-mocha

A simple wrapper for running multiple mocha instances from a single grunt task target.

## Abilities

1. run mocha multiple times from a single target
2. store pass-through variables into a config file, for use by other aspects of the application under test

Both of the above, for me, facilitate doing selenium webdriver testing. For that, each mocha run is a different browser target. And, my selenium test scripts 
use the passed-through variables to configure the test runs. Perhaps you'll find it useful for this or other purposes.

