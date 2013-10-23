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
      mocha_options = "",
      opts_array = [];

    //wipe out nconf file
    fs.writeFileSync(config, "{}");
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
    _.each(_.omit(options, 'reportLocation', 'iterations'), function(value, key) {
      if (key.match(/^[A-Z]{1}/)) {
        if (nconf.get(key)) { //check if the key is set already (i.e. env, argv)
          value = nconf.get(key);
        } else {
          nconf.set(key, value);
        }

      }
      if (value !== "") {
        mocha_options += " --" + key + " " + value + " ";
        opts_array.push("--" + key);
        opts_array.push(value);
      }
    });

    this.filesSrc.forEach(function(el) {
      mocha_options += el + " ";
      opts_array.push(el);
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
        var cmd = mocha_path + mocha_options,
          child,
          stdout,
          stderr;
        grunt.log.writeln(mocha_path);
        grunt.log.writeln(opts_array);
        child = child_process.spawn(mocha_path, opts_array);

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

      });

    }, function(err) {
      //console.log("DONE!", err);
      done(err)
    });
  });
};