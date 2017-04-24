# glob-exec

Yet another command-line wrapper for [glob](https://www.npmjs.com/package/glob)!

## Usage

```
glob-exec [--foreach [--parallel]] [--glob [glob-options]] glob-pattern command
```

`glob-pattern` is a glob pattern as detailed in the [glob](https://www.npmjs.com/package/glob) documentation.

`foreach` specifies that the command should be executed for each file found.  
If not specified, the default is to run a single command with all files.

`parallel` specifies that commands should be executed in parallel.  
It only applies when `foreach` is specified.  
If not specified, the default is to run commands in sequence.

`glob-options` are a list of (subarg)[https://www.npmjs.com/package/subarg] formatted options that will be passed to the [glob](https://www.npmjs.com/package/glob) function.

`command` is the command that will be executed. See the **Details** section below for additional information.

## Details

_glob-exec_ runs in two different modes of operation that have different semantics. The first one is used when `foreach` **is not** specified on the command-line. It is the default mode and is called the _all_ mode. The second one is used when `foreach` **is** specified on the command-line. It is called the _foreach_ mode.

In both modes, the `command` argument can use basic JavaScript expressions by surrounding them with two sets of curly brackets (like this: `{{...}}`). The result of the expression will be converted to string and replaced in the command (for example: `{{new Date().toISOString()}}`).

This JavaScript expression can use all [Node.js global objects](https://nodejs.org/docs/latest-v6.x/api/globals.html) as well as some mode-specific variables. This allows for quite complex yet familiar usage of the globbing expression result (for example: `{{files.join(' ** ')}}` or `{{file.relative('./src').substr(0, 3)}}`). See the **Examples** section below for more complex examples.

Any expression found which is not valid JavaScript (or which throws an exception) will not be replaced in the resulting command.

### _all_ mode

> This mode is used when `foreach` **is not** specified on the command-line.

With this mode, a single command will be run. It may/should process all the files found by the globbing expression.

In addition to [Node.js global objects](https://nodejs.org/docs/latest-v6.x/api/globals.html), the command may use the following variable:
* `files` [{Array\<String\>}](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array): list of files found by the globbing expression.

### _foreach_ mode

> This mode is used when `foreach` **is** specified on the command-line.

With this mode, the command will be run for each file found by the globbing expression.

In addition to [Node.js global objects](https://nodejs.org/docs/latest-v6.x/api/globals.html), the command may use the following variable:
* `file` [{Object}](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object): a file found by the globbing expression.
  * `root` [{String}](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String): root folder as returned by [Node.js `path.parse`](https://nodejs.org/docs/latest-v6.x/api/path.html#path_path_parse_path).
  * `dir` [{String}](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String): file directory hierarchy as returned by [Node.js `path.parse`](https://nodejs.org/docs/latest-v6.x/api/path.html#path_path_parse_path).
  * `base` [{String}](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String): file base as returned by [Node.js `path.parse`](https://nodejs.org/docs/latest-v6.x/api/path.html#path_path_parse_path).
  * `ext` [{String}](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String): file extension as returned by [Node.js `path.parse`](https://nodejs.org/docs/latest-v6.x/api/path.html#path_path_parse_path).
  * `name` [{String}](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String): file name as returned by [Node.js `path.parse`](https://nodejs.org/docs/latest-v6.x/api/path.html#path_path_parse_path).
  * `path` [{String}](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String): full path to the file as obtained from the globbing expression.
  * `toString()` [{Function}](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions): full path to the file as obtained from the globbing expression (allows direct use of `{{file}}`).
  * `relative(from)` [{Function}](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions): relative path of the file from `from` as returned by [Node.js `path.relative(from, this.path)`](https://nodejs.org/docs/latest-v6.x/api/path.html#path_path_relative_from_to).

## Examples

### _all_ mode

```sh
# prints the number of files found (by accessing the length property) and the files themselves
glob-exec "./src/**/*.ts" -- "echo found {{files.length}} files: {{files}}!"

> found 2 files: ./src/cli.ts,./src/glob-exec.ts!
```

```sh
# invokes browserify on all files to create a single bundle
# passes the output to exorcist to extract the source-map
glob-exec "./lib/**/*.js" -- "browserify --debug {{files.join(' ')}} | exorcist ./browser/index.js.map > ./browser/index.js"
```

```sh
# DO NOT DO THAT! -- TAKE A STEP BACK BEFORE WRITING SUCH CODE
# shows how complex JavaScript can be done
glob-exec "./lib/**/*.js" -- "echo {{(function() { var fs = require('fs'); return files.map(function(f) { return f + ': ' + fs.statSync(f).mtime.toISOString(); }).join(', '); })()}}"

> ./lib/cli.js: 2017-04-01T10:42:12.359Z, ./lib/glob-exec.js: 2017-04-01T10:42:12.339Z
```

### _foreach_ mode

```sh
# prints each file found in foreach mode
glob-exec --foreach "./src/**/*.ts" -- "echo found {{file}}"

> found ./src/cli.ts
> found ./src/glob-exec.ts
```

```sh
# shows that commands are executed in sequence when used without --parallel
glob-exec --foreach "./src/**/*.ts" -- "node -e \"setTimeout(function() { console.log(new Date().toTimeString() + ': {{file}}'); }, 2000);\""

> 10:42:02 GMT+0200 (Romance Daylight Time): ./src/cli.ts
> 10:42:04 GMT+0200 (Romance Daylight Time): ./src/glob-exec.ts
```

```sh
# shows that commands are executed simultaneously when used with --parallel
glob-exec --foreach --parallel "./src/**/*.ts" -- "node -e \"setTimeout(function() { console.log(new Date().toTimeString() + ': {{file}}'); }, 2000);\""

> 11:42:04 GMT+0200 (Romance Daylight Time): ./src/cli.ts
> 11:42:04 GMT+0200 (Romance Daylight Time): ./src/glob-exec.ts
```

```sh
# invokes browserify on each file to create a bundle per file
# passes the output to exorcist to extract the source-map
glob-exec --foreach --parallel "./lib/**/*.js" -- "browserify --debug {{file}} | exorcist ./browser/{{file.relative('./lib')}}.map > ./browser/{{file.relative('./lib')}}"
```

## Copyright & License

Copyright Franck Pascutti 2017.  
Distributed under the Boost Software License, Version 1.0.  
(See accompanying file [LICENSE\_1\_0.txt](LICENSE_1_0.txt) or copy at http://www.boost.org/LICENSE_1_0.txt)
