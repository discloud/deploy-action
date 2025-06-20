import test, { suite } from "node:test";
import zipModule from "../out/zip.js";

/** @type {typeof zipModule} */
const zip = zipModule.default;

suite("ZIP", async () => {
  await test("Testing empty zip", async (t) => {
    const glob = `__not_expected_files__${Math.random()}`;
    const expectedBufferSize = 22;

    const buffer = await zip(glob);

    t.assert.strictEqual(buffer.length, expectedBufferSize);
  });
});
