#!/usr/bin/env node

import { execSync } from "child_process";
import { all, foreach } from "./glob-exec";

// tslint:disable-next-line:no-var-requires
const subarg: any = require("subarg"); // no type definition for `subarg` yet

const argv: any = subarg(process.argv.slice(2), {
  boolean: ["foreach"]
});

const pattern: string = argv._.shift();
const command: string = argv._.join(" ");

if (argv.foreach) {

  foreach(pattern, command, argv.glob).then((cmds: string[]): void => {
    cmds.forEach((cmd: string): void => {
      execSync(cmd, { stdio: "inherit" });
    });
  }).then(undefined, (err: any): void => {
    throw err;
  });

} else {

  all(pattern, command, argv.glob).then((cmd: string): Buffer => {
    return execSync(cmd, { stdio: "inherit" });
  }).then(undefined, (err: any): void => {
    throw err;
  });

}
