
'use strict';

module.exports = function(grunt) {
    var rRemotePath = /^(?:https?:|file:)/;
    var rAbsPath = /^(?:\/)/;

    function detectDestType(dest) {
        if (grunt.util._.endsWith(dest, '/')) {
            return 'directory';

        } else {
            return 'file';
        }
    }
    
    function unixifyPath(filePath) {
        return filePath.replace(/\\/g, '/');
    }
    
    function isRemotePath(path) {
        return path.match(rRemotePath);
    }

    function isAbsPath(path) {
        return path.match(rAbsPath);
    }
    
    function isBase64Path(path) {
        return path.match(/^data:.*base64/);
    }
    
    return {
        detectDestType: detectDestType,
        unixifyPath: unixifyPath,
        isRemotePath: isRemotePath,
        isAbsPath: isAbsPath,
        isBase64Path: isBase64Path
    }
};