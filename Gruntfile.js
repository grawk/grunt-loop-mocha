module.exports = function (grunt) {

	// Project configuration.
	grunt.initConfig({
		watch: {
			files: '<config:lint.files>',
			tasks: 'default'
		},
		//Mocha configuration
		loopmocha: {
			src: ["test/*.js"],
			options: {
				iterations: [
					{
						"description": "first",
						"SOME_KEY": "some value"
					},
					{
						"description": "second",
						"SOME_OTHER_KEY": "some other value"
					},
					{
						"description": "third",
						"A_THIRD_KEY": "another value"
					},
					{
						"description": "fourth",
						"A_FOURTH_KEY": "blah"
					},
					{
						"description": "fifth",
						"A_FIFTH_KEY": "BLERG",
						"A_SIXTH_KEY": 123
					}
				],
				mocha: {
					parallel: true,
					globals: ['should'],
					timeout: 3000,
					ui: 'bdd',
					reporter: "xunit",
					reportLocation: "test/report"
				},
				env1: {
					stringVal: "fromfile"
				},
				env2: {
					jsonVal: {
						foo: {
							bar: {
								stringVal: "baz"
							}
						}
					}
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