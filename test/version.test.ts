import { expect } from "chai";
import "mocha";

import version from "../src/version";

describe("version", (): void => {
  it("should return '0.0.1'.", (): void => {
    expect(version()).to.be.equal("0.0.1");
  });
});
