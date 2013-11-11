/*
 * grunt-loop-mocha
 * https://github.com/grawk/grunt-loop-mocha
 *
 * Copyright (c) 2013 Matt Edelman
 * Licensed under the MIT license.
 */
"use strict";

module.exports = function(grunt) {

  var path = require('path'),
    fs = require('fs'),
    util = grunt.util,
    nutil = require('util'),
    child_process = require("child_process"),
    _ = util._,
    exists = grunt.file.exists;

  grunt.registerMultiTask('loopmocha', 'Run mocha multiple times', function() {

    var options = this.options(),
      reportLocation = options.reportLocation || '',
      binPath = '.bin/mocha' + (process.platform === 'win32' ? '.cmd' : ''),
      mocha_path = path.join(__dirname, '..', '/node_modules/', binPath),
      config = options.config || undefined,
      iterations = options.iterations || undefined,
      done = this.async(),
      filesSrc = this.filesSrc,
      opts_array = [];

    
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



    util.async.forEachSeries(iterations, function(el, cb) {
      var i,
        opts = {},
        localopts = []; // = opts_array.slice(0);

      _.each(_.omit(options, 'reportLocation', 'iterations'), function(value, key) {
        if (value !== 0) {
          opts[key] = value || "";
        }
      });
      //console.log(localopts, "localopts");
      if (options.reporter === "xunit-file") {
        process.env.XUNIT_FILE = reportLocation + "/xunit-" + ((el.iterationLabel) ? el.iterationLabel + "-" : "" || "") + (new Date()).getTime() + ".xml";
        console.log(process.env.XUNIT_FILE);
      }
      for (i in el) {
        opts[i] = el[i] || "";
      }
      //move opts object to array
      Object.keys(opts).forEach(function(key) {
        if (key === "iterationLabel") {
          return;
        }
        localopts.push("--" + key);
        if (opts[key] !== "" || opts[key] !== undefined) {
          localopts.push(opts[key]);
        }
      });
      filesSrc.forEach(function(el) {
        localopts.push(el);
      });
        var child,
          stdout,
          stderr;
        grunt.log.writeln(mocha_path);
        grunt.log.writeln(localopts);

        child = child_process.spawn(mocha_path, localopts);

        child.stdout.on('data', function(buf) {
          console.log(String(buf));
          stdout += buf;
        });
        child.stderr.on('data', function(buf) {
          console.log(String(buf));
          stderr += buf;
        });
        child.on('close', function(code) {
          console.log('grunt-loop-mocha close with code', code);
          if (code !== 0) {
            cb(new Error("grunt-loop-mocha encountered a non-success exit code"));
          } else {
            cb();
          }
        });


    }, function(err) {
      done(err);
    });
  });
};