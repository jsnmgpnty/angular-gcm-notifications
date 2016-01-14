module.exports = function (grunt) {
    grunt.initConfig({
    	bower: {
            install: {
                options: {
                    targetDir: "sample/lib",
                    layout: "byComponent",
                    cleanTargetDir: false
                }
            }
		},
        copy: {
        	main: {
        		files: [
		      		{
		      			expand: true,
		      			src: 'src/js/angular-gcm-notifications.js', 
		      			dest: 'sample/lib/', 
		      			filter: 'isFile',
		      			flatten: true
		      		},
		      		{
		      			expand: true,
		      			src: 'src/js/gcmService.js', 
		      			dest: 'sample/', 
		      			filter: 'isFile',
		      			flatten: true
		      		}
				],
			}
		},
		uglify: {
			jsMinify: {
				files: {
					'dist/angular-gcm-notifications.min.js': ['src/js/angular-gcm-notifications.js']
				}
			},
			service: {
                options: {
                    preserveComments: false
                },
                files: {
                    'dist/gcmService.min.js': [
                        "src/js/gcmService.js"
                    ]
                }
            },
		}
    });

    grunt.registerTask("default", ["uglify", "bower:install", "copy:main"]);

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks("grunt-bower-task");
};