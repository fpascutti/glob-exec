#!/usr/bin/env node

import { ChildProcess, execSync, spawn } from "child_process";
import { all, foreach } from "./glob-exec";

function execute(cmd: string): Promise<void> {
  return new Promise<void>((resolve: () => void, reject: (reason: any) => void): void => {

    const proc: ChildProcess = spawn(cmd, [], { stdio: "inherit", shell: true });

    const onerror: (err: Error) => void = (err: Error): void => {
      proc.removeListener("close", onclose);
      reject(err);
    };
    const onclose: (code: number) => void = (code: number): void => {
      proc.removeListener("error", onerror);
      if (code !== 0) {
        reject(new Error("Command failed: " + cmd));
      } else {
        resolve();
      }
    };

    proc.once("error", onerror);
    proc.once("close", onclose);
  });
}

function executeSync(cmd: string): void {
  execSync(cmd, { stdio: "inherit" });
}

function main(args: any): Promise<void | void[]> {
  const pattern: string = args._.shift();
  const command: string = args._.join(" ");

  if (args.foreach) {
    if (args.parallel) {
      return foreach(pattern, command, args.glob).then((cmds: string[]): Promise<void[]> => {
        return Promise.all(cmds.map(execute));
      });
    } else {
      return foreach(pattern, command, args.glob).then((cmds: string[]): void => {
        cmds.forEach(executeSync);
      });
    }
  } else {
    return all(pattern, command, args.glob).then(executeSync);
  }
}

// tslint:disable-next-line:no-var-requires
const subarg: any = require("subarg"); // no type definition for `subarg` yet
const argv: any = subarg(process.argv.slice(2), {
  boolean: ["foreach", "parallel"],
});
main(argv).catch((reason: any): void => {
  // make the application fail
  setImmediate((): never => { throw reason; });
});
