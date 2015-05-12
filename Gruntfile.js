"use strict";
var coveralls = require("coveralls");
module.exports = function (grunt) {

	var _ = grunt.util._;

	var sourceFiles = [ "*.js", "lib/**/*.js" ];
	var testFiles   = [ "test/**/*.js" ];
	var allFiles    = sourceFiles.concat(testFiles);

	var defaultJsHintOptions = grunt.file.readJSON("./.jshint.json");
	var testJsHintOptions = _.defaults(
		grunt.file.readJSON("./test/.jshint.json"),
		defaultJsHintOptions
	);

	var targetEnv = grunt.option("target") || "prod";
	grunt.initConfig({
		browserify : {
			webrtcClient : {
				dest    : "dist/BWClient.js",
				src     : [ "lib/BWClient.js" ],
				options : {
					alias : {
						"./configFile.js" : "./config/" + targetEnv + ".js"
					},
					debug : false
				},
			}
		},
		uglify     : {
			build : {
				src  : "dist/BWClient.js",
				dest : "dist/BWClient.min.js"
			}
		},
		jscs : {
			src     : allFiles,
			options : {
				config : ".jscsrc"
			}
		},

		jshint : {
			src     : sourceFiles,
			options : defaultJsHintOptions,
			test    : {
				options : testJsHintOptions,
				files   : {
					test : testFiles
				}
			}
		},

		mochaIstanbul : {
			coverage : {
				src     : "test/unit",
				options : {
					coverage : true,
					reporter : "spec",
					check    : {
						statements : 100,
						branches   : 100,
						lines      : 100,
						functions  : 100
					}
				}
			}

		},

		watch : {
			scripts : {
				files   : allFiles,
				tasks   : [ "lint", "style" ],
				options : {
					spawn : false,
				},
			},
		},

		clean : [ "coverage" ]
	});

	grunt.event.on("coverage", function (lcov, done) {
		coveralls.handleInput(lcov, function (err) {
			if (err) {
				return done(err);
			}
			done();
		});
	});

	// Load plugins
	grunt.loadNpmTasks("grunt-browserify");
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-jscs");
	grunt.loadNpmTasks("grunt-mocha-istanbul");
	grunt.loadNpmTasks("grunt-contrib-uglify");

	// Rename tasks
	grunt.task.renameTask("mocha_istanbul", "mochaIstanbul");

	// Register tasks
	grunt.registerTask("compile-assets", "Build compiled assets.",
		[
			"browserify",
			"uglify"
		]);
	grunt.registerTask("assets", "Build compiled assets and install asset dependencies.",
		[ "compile-assets" ]);
	grunt.registerTask("test", [ "mochaIstanbul:coverage" ]);
	grunt.registerTask("lint", "Check for common code problems.", [ "jshint" ]);
	grunt.registerTask("style", "Check for style conformity.", [ "jscs" ]);
	grunt.registerTask("default", [ "clean", "lint", "style", "test" ]);

};