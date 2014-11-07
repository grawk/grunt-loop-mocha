var spawn = require("child_process").spawn
var path  = require('path')
var util  = require('util')
var _     = require('lodash')
var async = require('async')

/**
  * Main level.  Grunt is injected
  * from the task.  _spawn is injected
  * to help with tests.
  */
module.exports = function exports (grunt, _spawn) {
  // injection here
  if (_spawn) {
    spawn = _spawn
  }
  // Give us a function that will work with async
  return function processLoop(op, cb) {
    // rip up the op into vars
    var filesSrc                      = op.filesSrc
      , mocha_path                    = op.mocha_path
      , reportLocation                = op.reportLocation
      , localopts                     = op.localopts
      , localOtherOptionsStringified  = op.localOtherOptionsStringified
      , itLabel                       = op.itLabel
      , localMochaOptions             = op.localMochaOptions

    var limit         = localMochaOptions.limit || 5
    var parallelType  = localMochaOptions.parallelType
    var env           = _.merge(process.env, localOtherOptionsStringified)

    // pick a way to split up the work
    if (parallelType === 'directory') {   // async by directory
      async
        .mapLimit(_.chain(filesSrc)
                    // group by the directory path
                    .groupBy(function(file) {
                      return path.dirname(file)
                    })
                    // rework the data into something async will be ok with
                    .map(function(files, dir) {
                      return [files, dir]
                    })
                    .value()
                , limit
                , function(args, _cb) {
                    // update the label, do the work
                    work(itLabel + ':' + args[1].replace('/', '-')
                        , args[0]
                        , _.cloneDeep(env)
                        , _.cloneDeep(localopts)
                        , _cb)
                }
                , cb)
    } else if (parallelType === 'file') { // async by file
      async
        .mapLimit(filesSrc
                , limit
                , function(file, _cb) {
                    // update the label, do the work
                    work(itLabel + ':' + file.replace('/', '-')
                        , [file]
                        , _.cloneDeep(env)
                        , _.cloneDeep(localopts)
                        , _cb)
                }
                , cb)
    }  else {                             // not async
      work(itLabel, filesSrc, env, localopts
          , function(err, result) {
              // to normalize results, we wrap this one in an
              // array, even though there is only one.
              cb(err, [result])
            })
    }

    function work(_itLabel, _filesSrc, _env, _op, _cb) {

      // inform the world that we are going to start
      grunt.log.writeln("[grunt-loop-mocha] iteration: ", _itLabel);

      // update the reporter file
      if (localMochaOptions.reporter === "xunit-file") {
        // Only update the env for the spawned process.
        _env.XUNIT_FILE = reportLocation + "/xunit-" + _itLabel + ".xml";
        grunt.log.writeln("[grunt-loop-mocha] xunit output: ", _env.XUNIT_FILE);
      }

      // push the files into localopts
      _filesSrc.forEach(function (el) {
        _op.push(el);
      });

      // more notify
      grunt.log.writeln("[grunt-loop-mocha] mocha argv: ", _op.toString());

      // start a process
      var child = spawn(mocha_path
                      , _op
                      , {env: _env});

      // pipe the output (in paralell this is going to be noisey)
      child.stdout.pipe(process.stdout)
      child.stderr.pipe(process.stderr)

      // report back the outcome
      child.on('close', function (code) {
        _cb(null, [code, _itLabel])
      });
    }
  }
}