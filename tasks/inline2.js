/*
 * grunt-inline2
 * https://github.com/iulo/grunt-inline2
 *
 * Copyright (c) 2016 iulo
 * Licensed under the MIT license.
 */

'use strict';

// var fs = require('fs');

module.exports = function(grunt) {
    var path = require('path');
    var Datauri = require('datauri');
    var UglifyJS = require('uglify-js');
    var CleanCSS = require('clean-css');
    var util = require('../lib/util')(grunt);
    var _ = grunt.util._;


    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    grunt.registerMultiTask('inline2', 'Inlines img, script and link tags into the same file', function() {
        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            tag: '__inline',
            exts: ['html']
        });

        if (options.staticPath === undefined) {
            options.staticPath = process.cwd();
            grunt.log.warn('don\'t get staticPath from options, use default as: process.cwd()');
        }

        var exts = options.exts;
        // var dest = this.data.dest;

        var relativeTo = options.relativeTo;
        var isExpandedPair;

        this.files.forEach(function(filePair) {
            isExpandedPair = filePair.orig.expand || false;

            filePair.src.forEach(function(filePath) {
                if (!grunt.file.exists(filePath)) {
                    grunt.log.warn('Source file "' + filePath + '" not found.');
                    return false;
                }
                // console.log('filePair.dest' + filePair.dest)
                var fileType = path.extname(filePath).replace(/^\./, '');
                var fileContent = grunt.file.read(filePath);
                var destfilePath = '';

                grunt.log.writeln('Processing: ' + filePath + '...');

                // handle file
                if (exts === fileType || fileType === 'html') {
                    fileContent = htmlHandle(filePath, fileContent, relativeTo, options);
                    
                } else if (fileType === 'css') {
                    fileContent = cssHandle(filePath, fileContent, relativeTo, options);
                }

                // dest file
                if (util.detectDestType(filePair.dest) === 'directory') {
                    destfilePath = isExpandedPair ? filePair.dest : util.unixifyPath(path.join(filePair.dest, filePath));

                } else {
                    if (filePair.orig.dest) {
                        destfilePath = util.unixifyPath(filePair.dest);
                    } else {
                        destfilePath = filePath;
                    }
                }

                grunt.file.write(destfilePath, fileContent);

                grunt.log.ok('write file: ' + destfilePath);
            });
        });

        function htmlHandle(filePath, fileContent, relativeTo, options) {
            if (relativeTo) {
                filePath = filePath.replace(/[^\/]+\//, relativeTo);
            }

            /**
             * replace `<inline src="xxx.html" />` with xxx.html content
             * @method _inlineInlineTag
             * @param {String} content
             * @returns {String}
             */
            function _inlineInlineTag(content) {
                content = content.replace(/<inline.+?src=(["'])([^"']+?)\1\s*?\/?>/g, function(matchedWord, p1, src) {
                    var ret = matchedWord;
                    var inlineFilePath;

                    if (util.isRemotePath(src)) {
                        return ret;

                    } else if (util.isAbsPath(src)) {
                        inlineFilePath = path.join(util.unixifyPath(options.staticPath), src);

                    } else {
                        inlineFilePath = path.resolve(path.dirname(filePath), src);
                    }

                    // remove query
                    inlineFilePath = inlineFilePath.replace(/\?.*$/, '');

                    if (grunt.file.exists(inlineFilePath)) {
                        ret = grunt.file.read(inlineFilePath);
                        // recursive comrepile
                        ret = htmlHandle(inlineFilePath, ret, null, options);

                    } else {
                        grunt.log.error("Couldn't find " + inlineFilePath + '!');
                    }

                    return ret;
                });

                return content;
            }

            /**
             * replace `<script src="xxx.js?__inline"></script>` with `<script>\n' + code + '\n</script>`
             * @method _inlineScript
             * @param {String} content
             * @returns {String}
             */
            function _inlineScript(content) {
                content = content.replace(/<script.+?src=(["'])([^"']+?)\1.*?>\s*<\/script>/g, function(matchedWord, p1, src){
                    var ret = matchedWord;
                    var inlineFilePath;

                    if (util.isRemotePath(src)) {
                        return ret;

                    } else if (util.isAbsPath(src)) {
                        inlineFilePath = path.join(util.unixifyPath(options.staticPath), src);

                    } else {
                        inlineFilePath = path.resolve(path.dirname(filePath), src);
                    }

                    if (src.indexOf(options.tag) !== -1) {
                        inlineFilePath = inlineFilePath.replace(/\?.*$/, '');

                        if (grunt.file.exists(inlineFilePath)) {
                            let code = grunt.file.read(inlineFilePath);

                            if (options.uglify) {
                                code = UglifyJS.minify(code, _.merge({fromString: true}, options.uglify)).code;
                            }

                            ret = '<script>\n' + code + '\n</script>';

                        } else {
                            grunt.log.error(filePath + " Couldn't find " + inlineFilePath + '!');
                        }
                    }

                    grunt.log.debug('ret = : ' + ret +'\n');

                    return ret;
                });

                return content;
            }

            /**
             * replace `<link href="xxx.css?__inline"></script>` with `<style>\n' + code + '\n</style>`
             * @method _inlineScript
             * @param {String} content
             * @returns {String}
             */
            function _inlineCss(content) {
                content = content.replace(/<link.+?href=(["'])([^"']+?)\1.*?\/?>/g, function(matchedWord, p1, src){
                    var ret = matchedWord;
                    var inlineFilePath;

                    if (util.isRemotePath(src)) {
                        return ret;

                    } else if (util.isAbsPath(src)) {
                        inlineFilePath = path.join(util.unixifyPath(options.staticPath), src);

                    } else {
                        inlineFilePath = path.resolve(path.dirname(filePath), src);
                    }

                    if (src.indexOf(options.tag) !== -1) {
                        inlineFilePath = inlineFilePath.replace(/\?.*$/, '');

                        if (grunt.file.exists(inlineFilePath)) {
                            let styleSheetContent = grunt.file.read(inlineFilePath);

                            // preCompile css: replace img
                            styleSheetContent = cssHandle(filePath, styleSheetContent, null, options);

                            if (options.cssmin) {
                                styleSheetContent = (new CleanCSS(options.cssmin).minify(styleSheetContent)).styles;
                            }

                            ret = '<style>\n' + styleSheetContent + '\n</style>';

                        } else {
                            grunt.log.error(filePath + " Couldn't find " + inlineFilePath + '!');
                        }
                    }
                    grunt.log.debug('ret = : ' + ret +'\n');

                    return ret;
                });

                return content;
            }

            /**
             * replace `<img src="xxx.png?__inline">` with `<img src="data:image...">`
             * @method _inlineScript
             * @param {String} content
             * @returns {String}
             */
            function _inlineImg(content) {
                content = content.replace(/<img.+?src=(["'])([^"':]+?)\1.*?\/?\s*?>/g, function(matchedWord, p1, src){
                    var	ret = matchedWord;
                    var inlineFilePath;

                    if (util.isBase64Path(src) || util.isRemotePath(src)) {
                        return ret;

                    } else if (util.isAbsPath(src)) {
                        inlineFilePath = path.join(util.unixifyPath(options.staticPath), src);

                    } else {
                        inlineFilePath = path.resolve(path.dirname(filePath), src);
                    }

                    if (src.indexOf(options.tag) !== -1) {
                        inlineFilePath = inlineFilePath.replace(/\?.*$/, '');

                        if(grunt.file.exists(inlineFilePath) ){
                            ret = matchedWord.replace(src, (new Datauri(inlineFilePath)).content);
                            
                        } else {
                            grunt.log.error(filePath + " Couldn't find " + inlineFilePath + '!');
                        }
                    }
                    grunt.log.debug('ret = : ' + ret +'\n');

                    return ret;
                });

                return content;
            }

            fileContent = _inlineScript(fileContent);
            fileContent = _inlineCss(fileContent);
            fileContent = _inlineImg(fileContent);
            fileContent = _inlineInlineTag(fileContent);

            return fileContent;
        }


        function cssHandle(filePath, fileContent, relativeTo, options) {
            if (relativeTo) {
                filePath = filePath.replace(/[^\/]+\//g, relativeTo);
            }

            fileContent = fileContent.replace(/url\((["'])*([^)'"]+)\1*\)/g, function(matchedWord, p1, imgUrl){
                var newUrl = imgUrl;
                var inlineFilePath;

                if (util.isBase64Path(newUrl) || util.isRemotePath(newUrl)) {
                    return matchedWord;

                } else if (util.isAbsPath(newUrl)) {
                    inlineFilePath = path.join(util.unixifyPath(options.staticPath), newUrl);

                } else {
                    inlineFilePath = path.resolve(path.dirname(filePath), newUrl);
                }

                grunt.log.debug( 'newUrl: ' + newUrl);
                grunt.log.debug( 'imgUrl: ' + imgUrl);
                grunt.log.debug( 'filePath: ' + filePath);

                if (newUrl.indexOf(options.tag) !== -1) {
                    inlineFilePath = inlineFilePath.replace(/\?.*$/, '');

                    if (grunt.file.exists(inlineFilePath) ) {
                        newUrl = (new Datauri(inlineFilePath)).content;

                    } else {
                        grunt.log.error(filePath + " Couldn't find " + inlineFilePath + '!');
                    }
                }

                return matchedWord.replace(imgUrl, newUrl);
            });


            return fileContent;
        }
    });

};
