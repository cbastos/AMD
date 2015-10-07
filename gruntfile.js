module.exports = function (grunt) {

	require("load-grunt-tasks")(grunt);

	var config = {};

	config.pkg = grunt.file.readJSON('package.json');

	config.jasmine = {
		pivotal: {
			src: 'dist/JSL.js',
			options: {
				specs: 'tests/classes/*.Spec.js',
			}
		}
	};

	config.jasmine_nodejs = {
		JSL: {
			specs: [
                "tests/browser-integration/**",
			]
		}
	};

	config.concat = {
		dist: {
			src: [
                './src/classes/DependenciesFactory.js',
                './src/classes/ModuleManager.js',
                './src/classes/ModuleRequestTracker.js',
                './src/classes/Promise.js',
                './src/classes/ScriptProvider.js',
                './src/JSL.js'
			],
			dest: './dist/JSL.js',
		},
	};

	config.uglify = {
		options: {
			sourceMap: true,
			banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
		},
		build: {
			src: './dist/JSL.js',
			dest: './dist/JSL.min.js'
		}
	};

	config.jshint = {
		all: ['Gruntfile.js', 'src/**/*.js', 'tests/**/*.js'],
		options: {
			validthis: true
		}
	};

	config.express = {
		dev: {
			options: {
				port: 4505,
				script: 'tests/browser-integration/server.js'
			}
		}
	};

	config.jsdoc = {
		dist: {
			src: ['src/*.js', 'src/classes/*.js'],
			options: {
				destination: 'doc'
			}
		}
	};

	grunt.initConfig(config);

	grunt.registerTask('Build', ['jshint', 'concat', 'uglify']);
	grunt.registerTask('Build-And-Launch-Browser-Integration-Tests', ['Build', 'express:dev', 'jasmine_nodejs']);
	grunt.registerTask('Build-And-Launch-Unit-Tests', ['Build', 'jasmine']);
	grunt.registerTask('Build-Documentation', ['jsdoc']);
	grunt.registerTask('Build-Release', ['Build', 'jasmine', 'jsdoc', 'express:dev', 'jasmine_nodejs']);

};