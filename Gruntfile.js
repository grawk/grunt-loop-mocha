module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    watch: {
      files: '<config:lint.files>',
      tasks: 'default'
    },
    //Mocha configuration
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
              "A_FIFTH_KEY": "BLERG",
              "A_SIXTH_KEY": 123
            }
          ],
          config: "test/conf.json",
          globals: ['should'],
          timeout: 3000,
          ui: 'bdd',
          reporter: "xunit-file",
          reportLocation: "test/report",
          RANDOM_UPPERCASE: "fromfile"
        }
      }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        node: true,
        es5: true,
        globals: {}
      },

      files: ['grunt.js', 'tasks/**/*.js']
    }
  });

  // Load local tasks.
  grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Default task.
  grunt.registerTask('test', 'loopmocha');
  grunt.registerTask('default', ['jshint', 'test']);
};