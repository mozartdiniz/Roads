/**
 * Roads Gruntfile
 */
module.exports = function(grunt) {
  'use strict';
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        stripBanners: true,
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
          '<%= grunt.template.today("yyyy-mm-dd") %> */'
      },
      dist: {
        src: ['src/Roads.js', 'src/Roads.i18n.js', 'src/Roads.Http.js', 'src/Roads.Globals.js', 'src/Roads.Filter.js', 'src/Roads.Events.js', 'src/Roads.Environment.js' ,'src/Roads.Controller.js', 'src/components/*.js'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    concat_css: {
      options: {},
      all: {
        src: ['src/**/*.css'],
        dest: 'dist/roads.css'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: ['dist/<%= pkg.name %>.js'],
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },
    copy: {
      main: {
        files: [
          {
            src: 'lib/x-tag.js',
            dest: 'examples/master_detail_navigation/lib/x-tag.js'
          },{
            src: 'dist/<%= pkg.name %>.js',
            dest: 'examples/master_detail_navigation/lib/<%= pkg.name %>.js'
          },{
            src: 'dist/<%= pkg.name %>.css',
            dest: 'examples/master_detail_navigation/css/<%= pkg.name %>.css'
          }
        ]
      }
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js',
        options: {
          files: ['lib/x-tag.js', 'dist/<%= pkg.name %>.min.js', 'test/**/*spec.js']
        }
      }
    }
  });

  grunt.registerTask('build', ['karma', 'concat', 'uglify', 'concat_css']);
  grunt.registerTask('deploy', ['copy']);

  // Default action for people who'll be running "grunt" from project's folder
  grunt.registerTask('default', ['build']);
};
