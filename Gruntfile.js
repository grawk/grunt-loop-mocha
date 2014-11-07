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
						"env1": {
							"someKey": "some value"
						}
					},
					{
						"description": "second",
						"env2": {
							"someOtherKey": "some other value"
						}
					},
					{
						"description": "third",
						"mocha": {
							"timeout": 4000
						}
					},
					{
						"description": "fifth",
						"env1": {
							"anotherKey": "BLERG"
						},
						"env2": {
							"yetAnotherKey": 123
						}

					},
					{
						"description": "many",
						"mocha": {
							"parallelType": "file"
						},
						"env1": {
							"anotherKey": "BLERG"
						},
						"env2": {
							"yetAnotherKey": 123
						}

					}
				],
				mocha: {
					parallel: true,
					globals: ['should'],
					timeout: 3000,
					ui: 'bdd',
					reporter: "xunit-file",
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