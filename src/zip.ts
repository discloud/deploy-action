import { debug, error, notice } from "@actions/core";
import { getExecOutput } from "@actions/exec";
import bytes from "bytes";
import { MAX_ZIP_SIZE } from "./constants";

/** @returns Array of chunks */
export default async function zip(glob?: string | string[]) {
  if (!glob) glob = ["**"];
  if (!Array.isArray(glob)) glob = [glob];

  const chunks: Buffer[] = [];
  await getExecOutput("npx", [
    "-y",
    "discloud-cli@latest",
    "zip",
    "-e",
    "buffer",
    ...glob,
  ], {
    listeners: {
      debug,
      stderr(data) {
        const text = data.toString();
        if (text.split("\n").length < 2) return;
        error(text);
      },
      stdout(data) {
        chunks.push(data);
      },
    },
    silent: true,
  });

  const file = new File(chunks, "");

  if (file.size > MAX_ZIP_SIZE)
    throw new Error(`The ZIP size cannot exceed 100 MB (1048576 KB). ZIP size: ${bytes(file.size)}`);

  notice(`ZIP size: ${bytes(file.size)}`);

  return chunks;
}
