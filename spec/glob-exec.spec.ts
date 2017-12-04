import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";

// tslint:disable-next-line:no-submodule-imports
import * as fs from "mz/fs";
import * as path from "path";

import { all, foreach } from "..";

chai.use(chaiAsPromised);
describe("glob-exec", (): void => {

  interface IDirectory {
    readonly name: string;
    readonly content: Array<string | IDirectory>;
  }

  const root: string = "./spec.out";
  const hierarchy: IDirectory = {
    content: [
      "index.js",
      "index.spec.js",
      "index.ts",
      "index.spec.ts",
      {
        content: [
          "index.js",
          "index.spec.js",
          "index.ts",
          "index.spec.ts",
        ],
        name: "subdir",
      },
    ],
    name: "data",
  };

  before("creating directory structure", (): PromiseLike<void> => {
    function buildDirectoryHierarchy(current: string, item: (string | IDirectory)): PromiseLike<void> {
      if (typeof item === "string") {
        const full = path.join(current, item);
        return fs.writeFile(full, "tmp", { encoding: "utf8", flag: "wx" });
      } else {
        const full = path.join(current, item.name);
        return fs.mkdir(full).then((): PromiseLike<void[]> => {
          return Promise.all(item.content.map((subitem: (string | IDirectory)): PromiseLike<void> => {
            return buildDirectoryHierarchy(full, subitem);
          }));
        }).then((): void => {
          // convert Promise<void[]> to Promise<void>
        });
      }
    }
    return buildDirectoryHierarchy(root, hierarchy);
  });

  after("removing directory structure", (): PromiseLike<void> => {
    function destroyDirectoryHierarchy(current: string, item: (string | IDirectory)): PromiseLike<void> {
      if (typeof item === "string") {
        const full = path.join(current, item);
        return fs.unlink(full);
      } else {
        const full = path.join(current, item.name);
        return Promise.all(item.content.map((subitem: (string | IDirectory)): PromiseLike<void> => {
          return destroyDirectoryHierarchy(full, subitem);
        })).then((): Promise<void> => {
          return fs.rmdir(full);
        });
      }
    }
    return destroyDirectoryHierarchy(root, hierarchy);
  });

  describe("all", (): void => {

    it("should return the correct command", (): PromiseLike<void> => {
      return chai.expect(all("./spec.out/data/**/*.ts", "found {{files.length}} files: {{files.sort().join('^')}}!"))
        .to.eventually.be.equal(
        "found 4 files: " +
        "./spec.out/data/index.spec.ts^" +
        "./spec.out/data/index.ts^" +
        "./spec.out/data/subdir/index.spec.ts^" +
        "./spec.out/data/subdir/index.ts!",
      );
    });

    it("should be OK when an empty set is obtained", (): PromiseLike<void> => {
      return chai.expect(all("./unknown/**/*", "Empty? {{files.length === 0}}"))
        .to.eventually.be.equal("Empty? true");
    });

  });

  describe("foreach", (): void => {

    it("should return the correct command", (): PromiseLike<void> => {
      return chai.expect(foreach("./spec.out/data/**/*.ts", "{{file}}: path: {{file.path}} | root: {{file.root}} " +
        "| dir: {{file.dir}} | base: {{file.base}} | ext: {{file.ext}} | name: {{file.name}} " +
        "| relative: {{file.relative('./spec.out/data').split('\\\\').join('/')}}"))
        .to.eventually.have.lengthOf(4)
        .and.include("./spec.out/data/index.spec.ts: path: ./spec.out/data/index.spec.ts " +
        "| root:  | dir: ./spec.out/data | base: index.spec.ts | ext: .ts | name: index.spec | relative: index.spec.ts")
        .and.include("./spec.out/data/index.ts: path: ./spec.out/data/index.ts " +
        "| root:  | dir: ./spec.out/data | base: index.ts | ext: .ts | name: index | relative: index.ts")
        .and.include("./spec.out/data/subdir/index.spec.ts: path: ./spec.out/data/subdir/index.spec.ts " +
        "| root:  | dir: ./spec.out/data/subdir | base: index.spec.ts " +
        "| ext: .ts | name: index.spec | relative: subdir/index.spec.ts")
        .and.include("./spec.out/data/subdir/index.ts: path: ./spec.out/data/subdir/index.ts " +
        "| root:  | dir: ./spec.out/data/subdir | base: index.ts | ext: .ts | name: index | relative: subdir/index.ts")
        ;
    });

    it("should be OK when an empty set is obtained", (): PromiseLike<void> => {
      return chai.expect(foreach("./unknown/**/*", "{{file}}"))
        .to.eventually.be.empty;
    });

  });
});
