import test, { suite } from "node:test";
import { zip } from "../out/zip.js";

suite("ZIP", async () => {
  await test("Testing zip", async (t) => {
    const glob = `__not_expected_files__${Math.random()}`;
    const expected_base64 = "UEsFBgAAAAAAAAAAAAAAAAAAAAAAAA==";

    /** @type {Buffer} */
    const buffer = await zip(glob);

    const actual = buffer.toString("base64");

    t.assert.strictEqual(actual, expected_base64);
  });
});
