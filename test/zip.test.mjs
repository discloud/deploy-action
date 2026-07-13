import test, { suite } from "node:test";
import zip from "../out/zip.js";

suite("ZIP", async () => {
  await test("Testing empty zip", async (t) => {
    const glob = `__not_expected_files__${Math.random()}`;
    const expectedBufferSize = 22;

    const file = await zip(glob, "file.zip");

    t.assert.strictEqual(file.size, expectedBufferSize);
  });
});
