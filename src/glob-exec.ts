import * as glob from "glob";
import * as path from "path";

function globy(pattern: string, opts?: glob.IOptions): Promise<string[]> {
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

export function all(pattern: string, cmd: string, opts?: glob.IOptions): Promise<string> {
  return globy(pattern, opts).then((files: string[]): string => {
    return replace(cmd, globals[0].concat(["files"]), globals[1].concat([files]));
  });
}

class ParsedPath {
  public readonly path: string;

  public readonly root: string;
  public readonly dir: string;
  public readonly base: string;
  public readonly ext: string;
  public readonly name: string;

  constructor(p: string) {
    this.path = p;
    ({ root: this.root, dir: this.dir, base: this.base, ext: this.ext, name: this.name } = path.parse(p));
  }

  public toString() {
    return this.path;
  }

  public relative(from: string): string {
    return path.relative(from, this.path);
  }

}

export function foreach(pattern: string, cmd: string, opts?: glob.IOptions): Promise<string[]> {
  return globy(pattern, opts).then((files: string[]): string[] => {
    return files.map((file: string): string => {
      const parsed: ParsedPath = new ParsedPath(file);
      return replace(cmd, globals[0].concat(["file"]), globals[1].concat([parsed]));
    });
  });
}
