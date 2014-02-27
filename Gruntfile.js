var request = require('request');

module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    authentication: grunt.file.readJSON('spec/config.json'),

    buildLayerFiles: {},

    jshint: {
      options: {
        jshintrc: true,
      },
      all: ['layers/*.js', 'src/**/*.js', 'spec/*.js'],
    },

    concat: {
      options: {
        separator: '\n',
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '*   Copyright (c) <%= grunt.template.today("yyyy") %> Environmental Systems Research Institute, Inc.\n' +
        '*   Apache License' +
        '*/\n'
      },
      js: {
        src: [
          'src/esri-leaflet-demographics.js',
        ],
        dest: 'dist/esri-leaflet-demographics-src.js'
      },
      css: {
        src: [
          'src/esri-leaflet-legend.css',
        ],
        dest: 'dist/esri-leaflet-legend-src.css'
      },
    },

    uglify: {
      options: {
        wrap: false,
        mangle: {
          except: ['L']
        },
        preserveComments: 'some',
        report: 'gzip'
      },
      dist: {
        files: {
          'dist/esri-leaflet-demographics.js': [
            'dist/esri-leaflet-demographics-src.js'
          ]
        }
      }
    },

    cssmin: {
      main: {
        options: {
          wrap: false,
          preserveComments: 'some',
          report: 'gzip'
        },
        files: {
          'dist/esri-leaflet-legend.css': [
            'dist/esri-leaflet-legend-src.css'
          ]
        }
      }
    },

    karma: {
      unit: {
        configFile: 'karma.conf.js',
        singleRun: true
      },
      watch: {
        configFile: 'karma.conf.js',
        singleRun: false
      }
    },

    'gh-pages': {
      options: {
        base: 'demo',
        repo: 'git@github.com:Esri/esri-leaflet-demographic-layer.git'
      },
      src: ['**']
    }
  });

  grunt.registerTask('test', function () {
    var task = grunt.option('watch') ? 'karma:watch':'karma:unit';
    var done = this.async();
    request({
      url: 'https://www.arcgis.com/sharing/oauth2/token',
      json: true,
      method: 'POST',
      form: {
        client_id: grunt.config('authentication.clientId'),
        client_secret: grunt.config('authentication.clientSecret'),
        grant_type: 'client_credentials'
      }
    }, function (err, body, response) {
      grunt.util.spawn({
        grunt: true,
        args: [task, '--access_token=' + response.access_token],
        opts: {
          stdio: 'inherit'
        }
      }, function () {
        done();
      });

    });
  });

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-gh-pages');

  grunt.loadTasks('tasks');

  grunt.registerTask('build', ['default', 'buildLayerFiles', 'concat', 'uglify', 'cssmin']);
  grunt.registerTask('default', ['jshint', 'test']);
};