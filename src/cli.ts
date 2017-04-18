#!/usr/bin/env node

import { execSync } from "child_process";
import globy from "./globy";

// tslint:disable-next-line:no-var-requires
const subarg: any = require("subarg"); // no type definition for `subarg` yet

const argv: any = subarg(process.argv.slice(2));
const pattern: string = argv._.shift();
globy(pattern, argv._.join(" "), argv.glob).then((cmd: string): Buffer => {
  return execSync(cmd, { stdio: "inherit" });
}).then(undefined, (err: any): void => {
  throw err;
});
