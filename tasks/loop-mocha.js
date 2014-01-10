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
		_ = util._,
		exists = grunt.file.exists,
		iterationError = false,
		iterationRemaining,
		noFail = false,
		iterationResults = {};

	grunt.registerMultiTask('loopmocha', 'Run mocha multiple times', function () {

		var options = this.options(),
			reportLocation = options.reportLocation || '',
			asyncMethod = (options.parallel && options.parallel.toString().toLowerCase() === "true") ? "forEach" : "forEachSeries",
			binPath = '.bin/mocha' + (process.platform === 'win32' ? '.cmd' : ''),
			mocha_path = path.join(__dirname, '..', '/node_modules/', binPath),
			config = options.config || undefined,
			iterations = options.iterations || undefined,
			iterationRemaining = Object.keys(iterations).length,
			iterationIndex = 0,
			done = this.async(),
			filesSrc = this.filesSrc,
			opts_array = [],
			runStamp = (new Date()).getTime();


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
				itLabel = runStamp + "-" + ((el.description) ? (el.description) : (++iterationIndex)); // = opts_array.slice(0);

			grunt.log.writeln("[grunt-loop-mocha] iteration: ", itLabel);
			_.each(_.omit(options, 'reportLocation', 'iterations', 'parallel', 'noFail'), function (value, key) {
				if (value !== 0) {
					opts[key] = value || "";
				}
			});
			//console.log(localopts, "localopts");
			if (options.reporter === "xunit-file") {
				process.env.XUNIT_FILE = reportLocation + "/xunit-" + itLabel + ".xml";
				grunt.log.writeln("[grunt-loop-mocha] xunit output: ", process.env.XUNIT_FILE);
			}
			if (options.noFail && options.noFail.toString().toLowerCase() === "true") {
				noFail = true;
			}
			for (i in el) {
				opts[i] = el[i] || "";
			}
			//move opts object to array
			//console.log(opts);
			Object.keys(opts).forEach(function (key) {
				if (key === "description") {
					return;
				}
				localopts.push("--" + key);
				if (opts[key] !== "" || opts[key] !== undefined) {
					localopts.push(opts[key]);
				}
			});
			filesSrc.forEach(function (el) {
				localopts.push(el);
			});
			var child,
				stdout,
				stderr;
			grunt.log.writeln("[grunt-loop-mocha] argv: ", localopts.toString());

			child = child_process.spawn(mocha_path, localopts);

			child.stdout.on('data', function (buf) {
				console.log(String(buf));
				stdout += buf;
			});
			child.stderr.on('data', function (buf) {
				console.log(String(buf));
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
			//console.log(iterationError, iterationRemaining);
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