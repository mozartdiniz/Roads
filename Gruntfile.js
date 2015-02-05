module.exports = function(grunt) {

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
    concat_css: {
      options: {},
      all: {
        src: ["src/**/*.css"],
        dest: "dist/roads.css"
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
            src: 'lib/x-tag.js', 
            dest: 'examples/master_detail_navigation/lib/x-tag.js'
          },{
            src: 'dist/<%= pkg.name %>.js', 
            dest: 'examples/master_detail_navigation/lib/<%= pkg.name %>.js'
          },{
            src: 'dist/<%= pkg.name %>.css', 
            dest: 'examples/master_detail_navigation/css/<%= pkg.name %>.css'
          },
          {
            src: 'lib/x-tag.js', 
            dest: 'examples/contacts_maintenance/lib/x-tag.js'
          },{
            src: 'dist/<%= pkg.name %>.js', 
            dest: 'examples/contacts_maintenance/lib/<%= pkg.name %>.js'
          },{
            src: 'dist/<%= pkg.name %>.css', 
            dest: 'examples/contacts_maintenance/css/<%= pkg.name %>.css'
          }          
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
  grunt.loadNpmTasks('grunt-concat-css');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('build', ['concat', 'uglify', 'concat_css']);

  grunt.registerTask('deploy', ['copy']);

};