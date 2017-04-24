import * as glob from "glob";

function globy(pattern: string, opts?: glob.IOptions): PromiseLike<string[]> {
  return new Promise<string[]>((resolve: (val: string[]) => void, reject: (reason: any) => void): void => {

    function cb(err: Error, matches: string[]) {
      if (!!err) {
        reject(err);
      } else {
        resolve(matches);
      }
    }

    if (opts === undefined) {
      glob(pattern, cb);
    } else {
      glob(pattern, opts, cb);
    }

  });
}

function replace(input: string, keys: string[], values: any[]): string {
  return input.replace(/\{\{(.*?)\}\}/g, (match: string, content: string): string => {
    const body: string = "do { return (" + content + "); } while(false);";
    const fn: (...args: any[]) => any = Function.apply(null, keys.concat([body]));
    try {
      const res: any = fn.apply(null, values);
      return res.toString();
    } catch (e) {
      return match;
    }
  });
}

const globals: [string[], any[]] = [
  ["Buffer", "__dirname", "__filename", "clearImmediate", "clearInterval", "clearTimeout",
    "console", "exports", "global", "module", "process", "require", "setImmediate", "setInterval", "setTimeout"],
  [Buffer, __dirname, __filename, clearImmediate, clearInterval, clearTimeout,
    console, exports, global, module, process, require, setImmediate, setInterval, setTimeout],
];

export function all(pattern: string, cmd: string, opts?: glob.IOptions): PromiseLike<string> {
  return globy(pattern, opts).then((files: string[]): string => {
    return replace(cmd, globals[0].concat(["files"]), globals[1].concat([files]));
  });
}
