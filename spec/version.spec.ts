import { expect } from "chai";
import "mocha";

import version from "..";

describe("version", (): void => {
  it("should return 'version 0.0.1'.", (): void => {
    expect(version()).to.be.equal("version 0.0.1");
  });
});
