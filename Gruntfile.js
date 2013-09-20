'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    jshint: {
      all: [
         'Gruntfile.js'
       , 'tasks/**/*.js'
      ]
    },
    clean: {
      tests: ['tmp']
    }
  });

  grunt.loadTasks('tasks');
  grunt.registerTask('default', ['update']);
};