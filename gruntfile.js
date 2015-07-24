module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-webdriver-jasmine-runner');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jasmine-nodejs');
    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-parallel');

    var config = {};

    config.pkg = grunt.file.readJSON('package.json');

    config.jasmine = {
        pivotal: {
            src: 'dist/AMD.js',
            options: {
                specs: 'tests/Promise.Spec.js',
            }
        }
    };

    config.jasmine_nodejs = {
        AMD: {
            specs: [
                "tests/browser-integration/**",
            ]
        }
    };

    config.concat = {
        dist: {
            src: [
                './src/DependenciesFactory.js',
                './src/ModuleManager.js',
                './src/StartingModulesTracker.js',
                './src/Promise.js',
                './src/ScriptManager.js',
                './src/AMD.js'
            ],
            dest: './dist/AMD.js',
        },
    };

    config.uglify = {
        options: {
            sourceMap: true,
            banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
        },
        build: {
            src: './dist/AMD.js',
            dest: './dist/AMD.min.js'
        }
    };

    config.jshint = {
        all: ['Gruntfile.js', 'src/**/*.js', 'tests/**/*.js']
    };

    config.express = {
        dev: {
            options: {
                port: 4505,
                script: 'tests/browser-integration/server.js'
            }
        }
    };

    grunt.initConfig(config);

    grunt.registerTask('Tests', ['jasmine']);
    grunt.registerTask('Build', ['concat', 'uglify']);
    grunt.registerTask('Build-and-Tests', ['express:dev', 'Build', 'Tests']);

};