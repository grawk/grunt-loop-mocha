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
		child_process = require("child_process"),
		_ = util._,
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
			asyncMethod = (mochaOptions.parallel && mochaOptions.parallel.toString().toLowerCase() === "true") ? "forEach" : "forEachSeries",
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


		util.async[asyncMethod](iterations, function (el, cb) {
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

			grunt.log.writeln("[grunt-loop-mocha] iteration: ", itLabel);
			_.each(_.omit(localMochaOptions, 'reportLocation', 'iterations', 'parallel', 'noFail'), function (value, key) {
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
				process.env.XUNIT_FILE = reportLocation + "/xunit-" + itLabel + ".xml";
				grunt.log.writeln("[grunt-loop-mocha] xunit output: ", process.env.XUNIT_FILE);
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

			filesSrc.forEach(function (el) {
				localopts.push(el);
			});
			var child,
				stdout,
				stderr;
			grunt.log.writeln("[grunt-loop-mocha] mocha argv: ", localopts.toString());

			child = child_process.spawn(mocha_path, localopts, {env: _.merge(process.env, localOtherOptionsStringified)});

			child.stdout.on('data', function (buf) {
				console.log(String(buf));
				stdout += buf;
			});
			child.stderr.on('data', function (buf) {
				console.error(String(buf));
				stderr += buf;
			});
			child.on('close', function (code) {
				iterationResults[itLabel] = code;
				iterationRemaining--;
				if (code !== 0) {
					iterationError = true;
					cb();
				} else {
					cb();
				}
			});


		}, function () {
			if (iterationError === true && iterationRemaining === 0) {
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
