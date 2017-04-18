# glob-exec

Yet another command-line wrapper for [glob](https://www.npmjs.com/package/glob)!

## Usage

```
glob-exec glob-pattern [--glob [glob-options]] [command]
```

`glob-pattern` is a glob pattern as detailed in the [glob](https://www.npmjs.com/package/glob) documentation.

`glob-options` are a list of (subarg)[https://www.npmjs.com/package/subarg] formatted options that will be passed to the [glob](https://www.npmjs.com/package/glob) function.

`command` is the command that will be executed (using Node's [execSync](https://nodejs.org/docs/latest-v6.x/api/child_process.html#child_process_child_process_execsync_command_options) function). This command-line can refer to the variables refered below and execute basic JavaScript.

## Variables

* `files` `{Array<String>}` list of files found by the globbing expression.

## Examples

```sh
glob-exec ./src/**/*.ts "echo found {{files.length}} files: {{files}}!"

> found 2 files: ./src/cli.ts,./src/glob-exec.ts!
```

```sh
glob-exec ./lib/**/*.js -- "browserify --debug {{files.join(' ')}}"
```

## Copyright & License

Copyright Franck Pascutti 2017.  
Distributed under the Boost Software License, Version 1.0.  
(See accompanying file [LICENSE\_1\_0.txt](LICENSE_1_0.txt) or copy at http://www.boost.org/LICENSE_1_0.txt)
