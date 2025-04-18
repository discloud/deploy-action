import test, { suite } from "node:test";
import module from "../out/zip.js";

/** @type {typeof module} */
const zip = module.default;

suite("ZIP", async () => {
  await test("Testing empty zip", async (t) => {
    const glob = `__not_expected_files__${Math.random()}`;
    const expected_base64 = "UEsFBgAAAAAAAAAAAAAAAAAAAAAAAA==";

    /** @type {Buffer} */
    const buffer = await zip(glob);

    const actual = buffer.toString("base64");

    t.assert.strictEqual(actual, expected_base64);
  });
});
