import test, { suite } from "node:test";
import module from "../out/zip.js";

/** @type {typeof module} */
const zip = module.default;

suite("ZIP", async () => {
  await test("Testing empty zip", async (t) => {
    const glob = `__not_expected_files__${Math.random()}`;
    const expectedBufferSize = 22;

    /** @type {Buffer} */
    const buffer = await zip(glob);

    t.assert.strictEqual(buffer.length, expectedBufferSize);
  });
});
