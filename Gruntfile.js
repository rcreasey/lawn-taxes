'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    jshint: {
      all: [
         'Gruntfile.js'
       , 'tasks/**/*.js'
      ]
    },
  });

  grunt.loadTasks('tasks');
  grunt.registerTask('default', ['goonmetrics.fetch', 'eve-central.fetch', 'cleanup']);
};