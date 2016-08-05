# grunt-inline2[![NPM version][npm-image]][npm-url]

*Inspired by [`grunt-inline`](https://github.com/chyingp/grunt-inline)*
> Inlines img, script and link tags into the same file

## Getting Started
This plugin requires Grunt `>=0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-inline2 --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-inline2');
```

## The "inline2" task

### Overview
In your project's Gruntfile, add a section named `inline2` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
    inline2: {
        html: {
            options: {
                staticPath: path.join(process.cwd(), 'test/static'),
                exts: ['html'],
                uglify: {
                    fromString: true,
                    mangle: {
                        except: ['$', 'jQuery']
                    },
                    compress: {
                        drop_console: false
                    }
                },
                cssmin: {
                    compatibility: 'ie7'
                }
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
```

### Options

#### staticPath
Type: `String`
Default value: `process.cwd()`

A string value that is used as root path.
For example staticPath was set `/home/xxx/test`, src in files like `/imgs/firefox.png?__inline` will be considered as `/home/xxx/test/imgs/firefox.png?__inline`

#### tag
Type: `String`
Default value: `__inline`

Only URLs that contain the value for tag will be inlined

#### exts
Type: `Array`
Default value: `['html']`

Setting an exts array allows multiple file extensions to be processed as html.

#### dest

If dest is assigned, the the source file  will be processed and then copied to the destination path.

#### uglify
Type: `Object`
Default value: `undefined`

If uglify is assigned, it will be pass to `uglify-js` as options, and .js file will be minified before inlined.

#### cssmin
Type: `Object`
Default value: `undefined`

If cssmin is assigned, it will be pass to `clean-css` as options, and .css file will be minified before inlined.


### Usage Examples
try test


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
* 20160805　　v0.0.5　　fix remote path img in css replace bug
* 20160805　　v0.0.4　　fix files dest
* 20160726　　v0.0.2　　fix files dest, css's img inline replace
* 20160720　　v0.0.1　　first release


[npm-url]: https://www.npmjs.com/package/grunt-inline2
[npm-image]: http://img.shields.io/npm/v/grunt-inline2.svg