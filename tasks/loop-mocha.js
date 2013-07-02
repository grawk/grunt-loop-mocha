/*
 * grunt-simple-mocha
 * https://github.com/yaymukund/grunt-simple-mocha
 *
 * Copyright (c) 2012 Mukund Lakshman
 * Licensed under the MIT license.
 */
"use strict";

module.exports = function(grunt) {

  var path = require('path'),
    util = grunt.util,
    child_process = require("child_process"),
    _ = util._,
    nconf = require("nconf"),
    exists = grunt.file.exists;

  grunt.registerMultiTask('loopmocha', 'Run mocha multiple times', function() {

    var options = this.options(),
      reportLocation = options.reportLocation || '',
      binPath = '.bin/mocha' + (process.platform === 'win32' ? '.cmd' : ''),
      mocha_path = path.join(__dirname, '..', '/node_modules/', binPath),
      config = options.config || undefined,
      iterations = options.iterations || undefined,
      done = this.async(),
      mocha_options = "";

    //configure nconf
    nconf.argv()
      .env()
      .file({
      file: config
    });

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
    _.each(_.omit(options, 'reportLocation', 'config', 'iterations'), function(value, key) {
      if (key.match(/^[A-Z]{1}/)) {
        nconf.set(key, value);
      } else {
        //set to mocha options
        mocha_options += " --" + key + " " + value + " ";
      }
    });

    this.filesSrc.forEach(function(el) {
      mocha_options += el + " ";
    });

    util.async.forEachSeries(iterations, function(el, cb) {
      var i;

      if (options.reporter === "xunit-file") {
        process.env.XUNIT_FILE = reportLocation + "/xunit-" + (new Date()).getTime() + ".xml";
        console.log(process.env.XUNIT_FILE);
      }
      for (i in el) {
        nconf.set(i, el[i]);
        console.log("set: " + i);
      }
      nconf.save(function(err) {
        var cmd = mocha_path + mocha_options;
        grunt.log.writeln(cmd);
        child_process.exec(cmd, function(err, stdout) {
          grunt.log.write(stdout);
          cb(err);
        });
      });

    }, function(err) {
      done(err)
    });
  });
};