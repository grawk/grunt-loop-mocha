/*
 * grunt-loop-mocha
 * https://github.com/grawk/grunt-loop-mocha
 *
 * Copyright (c) 2013 Matt Edelman
 * Licensed under the MIT license.
 */
"use strict";

module.exports = function (grunt) {

	var path = require('path'),
		fs = require('fs'),
		util = grunt.util,
		nutil = require('util'),
		child_process = require("child_process"),
		_ = require('lodash'),
		async = require('async'),
		exists = grunt.file.exists,
		iterationError = false,
		iterationRemaining,
		noFail = false,
		iterationResults = {};

	grunt.registerMultiTask('loopmocha', 'Run mocha multiple times', function () {
		var options = this.options(),
			mochaDefaultOptions = grunt.config.get("loopmocha.options.mocha"),
			mochaOptions = _.merge(mochaDefaultOptions, options.mocha),
			allDefaultOptions = grunt.config.get("loopmocha.options"),
			otherDefaultOptions = {},
			otherOptions = {},
			reportLocation = mochaDefaultOptions.reportLocation || '',
			asyncMethod = (mochaOptions.parallel && mochaOptions.parallel.toString().toLowerCase() === "true")
							? "map"
							: "mapSeries",
			binPath = '.bin/mocha' + (process.platform === 'win32' ? '.cmd' : ''),
			mocha_path = path.join(__dirname, '..', '/node_modules/', binPath),
			iterations = options.iterations || undefined,
			iterationRemaining = Object.keys(iterations).length,
			iterationIndex = 0,
			done = this.async(),
			filesSrc = this.filesSrc,
			runStamp = (new Date()).getTime();

		//catalog any extra default options
		_.each(_.omit(allDefaultOptions, 'src', 'basedir', 'mocha', 'iterations'), function (value, key) {
			otherDefaultOptions[key] = value;
		});
		//catalog any extra task specific options
		_.each(_.omit(options, 'src', 'basedir', 'mocha', 'iterations'), function (value, key) {
			otherOptions[key] = value;
		});
		//merge together the default and task specific extra options
		otherOptions = _.merge(otherDefaultOptions, otherOptions);
		if (!exists(mocha_path)) {
			var i = module.paths.length,
				bin;
			while (i--) {
				bin = path.join(module.paths[i], binPath);
				if (exists(bin)) {
					mocha_path = bin;
					break;
				}
			}
		}

		if (!exists(mocha_path)) {
			grunt.fail.warn('Unable to find mocha.');
		}


		// map or mapLimit.  The cb will take an err and result...
		async[asyncMethod](iterations, function (el, cb) {
			var i,
				opts = {},
				localopts = [],
				localOtherOptions = {},
				localOtherOptionsStringified = {},
				localMochaOptions = (el.mocha) ? _.merge(mochaOptions, el.mocha) : mochaOptions,
				itLabel = runStamp + "-" + ((el.description) ? (el.description) : (++iterationIndex)); // = opts_array.slice(0);

			//merge the iteration extra options with the default/task specific extra options
			_.each(_.omit(el, 'description', 'mocha'), function (value, key) {
				localOtherOptions[key] = value;
			});
			localOtherOptions = _.merge(otherOptions, localOtherOptions);

			//stringify the extra options for passage via env
			_.each(localOtherOptions, function (value, key) {
				console.log("[grunt-loop-mocha] setting ENV var ", key, "with value", value);
				localOtherOptionsStringified[key] = JSON.stringify(value);
			});

			// put the localMochaOptions into opts so we can pass
			// to mocha with --thing.  Remove options grunt-loop-mocha
			// is supporting
			_.each(_.omit(localMochaOptions
						, 'reportLocation'
						, 'iterations'
						, 'parallel'
						, 'noFail'
						, 'limit'        	// the limit var for mapLimit
						, 'parallelType')	// the kind of parallel run (better name?)
					, function (value, key) {
						if (value !== 0) {
							//console.log("added from A", key);
							opts[key] = value || "";
						}
					});
			if (localMochaOptions.reporter === "xunit-file") {
				var reportFolderExists = (fs.existsSync(reportLocation) && fs.statSync(reportLocation).isDirectory());
				if (!reportFolderExists) {
					done(new Error("[grunt-loop-mocha] You need to make sure your report directory exists before using the xunit-file reporter"));
				}
			}
			if (localMochaOptions.noFail && localMochaOptions.noFail.toString().toLowerCase() === "true") {
				noFail = true;
			}

			Object.keys(opts).forEach(function (key) {
				if (key === "description") {
					return;
				}
				localopts.push("--" + key);
				if (opts[key] !== "" && opts[key] !== undefined) {
					localopts.push(opts[key]);
				}
			});

			// spill off the processes.  This can be quite a few.
			// the results will be in the form
			// [[returnCode, itterationName], ...]
			require('./process-loop.js')(grunt)({
					filesSrc                    : filesSrc
				  , mocha_path                  : mocha_path
				  , reportLocation              : reportLocation
				  , localopts                   : localopts
				  , localOtherOptionsStringified: localOtherOptionsStringified
				  , itLabel                     : itLabel
				  , localMochaOptions			: localMochaOptions
				}
				, cb)

		}, function (err, results) {
			var iterationResults = results.reduce(function(results, runs) {
										runs.forEach(function(run){
											results[run[1]] = run[0]
											iterationError = iterationError || !!run[0]
										})
										return results
									}, {})
			if (iterationError) {
				var msg = "[grunt-loop-mocha] error, please check erroneous iteration(s): " + JSON.stringify(iterationResults);
				if (noFail === true) {
					console.log(msg);
					done();
				}
				else {
					done(new Error(msg));
				}

			} else {
				done();
			}
		});
	});
};
