module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        stripBanners: true,
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
          '<%= grunt.template.today("yyyy-mm-dd") %> */',
      },
      dist: {
        src: ['src/*.js', 'src/components/*.js'],
        dest: 'dist/<%= pkg.name %>.js',
      },
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
            src: 'dist/<%= pkg.name %>.min.js', 
            dest: '/Users/mozartdiniz/Sites/roads2/lib/<%= pkg.name %>.js'
          },
        ],
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
  
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('build', ['karma', 'concat', 'uglify']);

  grunt.registerTask('deploy', ['copy']);

};