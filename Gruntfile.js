/*
 * grunt-inline2
 * https://github.com/iulo/grunt-inline2
 *
 * Copyright (c) 2016 iulo
 * Licensed under the MIT license.
 */

'use strict';
var path = require('path');

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        inline2: {
            html: {
                options: {
                    staticPath: path.join(process.cwd(), 'test/static'),
                    exts: ['html']
                },
                expand: true,
                cwd: 'test/static/html/',
                src: ['*.html'],
                dest: 'test/output/html/'
            },
            css: {
                options: {
                    staticPath: path.join(process.cwd(), 'test/static'),
                    exts: ['html']
                },
                expand: true,
                cwd: 'test/static/css/',
                src: ['*.css'],
                dest: 'test/output/css/'
            }
        }
    });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  grunt.registerTask('test', ['inline2']);
  grunt.registerTask('default', ['test']);
};
