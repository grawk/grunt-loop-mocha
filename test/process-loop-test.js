"use strict";
describe("Process Loop", function() {
  var process       = require('../tasks/process-loop.js')
  var noop          = function noop(){}
  var expect        = require('chai').expect
  var EventEmitter  = require('events').EventEmitter

  it("should call spawn once", function(done) {

    var testMe = process({log:{writeln: noop}}
                        , function(path, op, env) {
                            // test here
                            expect(path)
                              .to.equal('some/mocha/path')
                            expect(op)
                              .to.deep.equal(['other', 'options', 'one', 'two'])
                            expect(env)
                              .to.have.deep.property('env.opt')
                              .that.equals('"process"')
                            expect(env)
                              .to.have.deep.property('env.XUNIT_FILE')
                              .that.equals('./a/report/location/xunit-Test Label.xml')

                            // We need to hand some stuff back...
                             var ee = new EventEmitter()
                            ee.stdout = {pipe:noop}
                            ee.stderr = {pipe:noop}
                            setTimeout(function() {
                              ee.emit('close', 0)
                            }, 1)
                            return ee
                        })

    testMe({filesSrc                    : ['one', 'two']
          , mocha_path                  : 'some/mocha/path'
          , reportLocation              : './a/report/location'
          , localopts                   : ['other', 'options']
          , localOtherOptionsStringified: {opt:'"process"'}
          , itLabel                     : 'Test Label'
          , localMochaOptions           : {reporter         : "xunit-file"
                                          , reportLocation  : "/some/path"}}
        , function(err, results) {
            expect(results)
              .to.deep.equal([[ 0, 'Test Label' ]])
            done()
          })
  })

  it("should call spawn once for each file", function(done) {
    var testMe = process({log:{writeln: noop}}
                        , function(path, op, env) {
                            // test here
                            expect(path)
                              .to.equal('some/mocha/path')
                            expect(env)
                              .to.have.deep.property('env.opt')
                              .that.equals('"process"')

                            if (op.indexOf('one') >= 0) {
                              expect(op)
                                .to.deep.equal(['other', 'options', 'one'])
                              expect(env)
                                .to.have.deep.property('env.XUNIT_FILE')
                                .that.equals('./a/report/location/xunit-Test Label:one.xml')

                            } else if (op.indexOf('two') >= 0) {
                              expect(op)
                                .to.deep.equal(['other', 'options', 'two'])
                              expect(env)
                                .to.have.deep.property('env.XUNIT_FILE')
                                .that.equals('./a/report/location/xunit-Test Label:two.xml')
                            } else {
                              expect(true).to.not.be.true
                            }

                            // We need to hand some stuff back...
                             var ee = new EventEmitter()
                            ee.stdout = {pipe:noop}
                            ee.stderr = {pipe:noop}
                            setTimeout(function() {
                              ee.emit('close', 0)
                            }, 1)
                            return ee
                        })

    testMe({filesSrc                    : ['one', 'two']
          , mocha_path                  : 'some/mocha/path'
          , reportLocation              : './a/report/location'
          , localopts                   : ['other', 'options']
          , localOtherOptionsStringified: {opt:'"process"'}
          , itLabel                     : 'Test Label'
          , localMochaOptions           : {reporter         : "xunit-file"
                                          , reportLocation  : "/some/path"
                                          , parallelType    : "file"}}
        , function(err, results) {
            expect(results)
              .to.deep.equal([ [ 0, 'Test Label:one' ], [ 0, 'Test Label:two' ] ])
            done()
          })
  })

  it("should call spawn once for each directory", function(done) {
    var testMe = process({log:{writeln: noop}}
                        , function(path, op, env) {
                            // test here
                            expect(path)
                              .to.equal('some/mocha/path')
                            expect(env)
                              .to.have.deep.property('env.opt')
                              .that.equals('"process"')

                            if (op.indexOf('/dir1/one') >= 0) {
                              expect(op)
                                .to.deep.equal(['other', 'options', '/dir1/one', '/dir1/two'])
                              expect(env)
                                .to.have.deep.property('env.XUNIT_FILE')
                                .that.equals('./a/report/location/xunit-Test Label:-dir1.xml')

                            } else if (op.indexOf('/dir2/one') >= 0) {
                              expect(op)
                                .to.deep.equal(['other', 'options', '/dir2/one', '/dir2/two'])
                              expect(env)
                                .to.have.deep.property('env.XUNIT_FILE')
                                .that.equals('./a/report/location/xunit-Test Label:-dir2.xml')
                            } else {
                              expect(true).to.not.be.true
                            }

                            // We need to hand some stuff back...
                             var ee = new EventEmitter()
                            ee.stdout = {pipe:noop}
                            ee.stderr = {pipe:noop}
                            setTimeout(function() {
                              ee.emit('close', 0)
                            }, 1)
                            return ee
                        })

    testMe({filesSrc                    : ['/dir1/one', '/dir1/two'
                                          , '/dir2/one', '/dir2/two']
          , mocha_path                  : 'some/mocha/path'
          , reportLocation              : './a/report/location'
          , localopts                   : ['other', 'options']
          , localOtherOptionsStringified: {opt:'"process"'}
          , itLabel                     : 'Test Label'
          , localMochaOptions           : {reporter         : "xunit-file"
                                          , reportLocation  : "/some/path"
                                          , parallelType    : "directory"}}
        , function(err, results) {
            expect(results)
              .to.deep.equal([ [ 0, 'Test Label:-dir1' ], [ 0, 'Test Label:-dir2' ] ])
            done()
          })
  })
})