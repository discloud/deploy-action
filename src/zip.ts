import { debug, error, notice } from "@actions/core";
import { getExecOutput } from "@actions/exec";
import bytes from "bytes";
import { MAX_ZIP_SIZE } from "./constants";

export default async function zip(glob?: string | string[]) {
  if (!glob) glob = ["**"];
  if (!Array.isArray(glob)) glob = [glob];

  const zipCommand = "discloud zip";

  const chunks: Buffer[] = [];
  let notSkippedFirstLine = true;
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
        if (notSkippedFirstLine) {
          notSkippedFirstLine = false;
          if (`${data}`.includes(zipCommand)) return;
        }
        chunks.push(data);
      },
    },
    silent: true,
  });

  const buffer = Buffer.concat(chunks);

  if (buffer.length > MAX_ZIP_SIZE)
    throw new Error(`The ZIP size cannot exceed 100 MB (1048576 KB). ZIP size: ${bytes(buffer.length)}`);

  notice(`ZIP size: ${bytes(buffer.length)}`);

  return buffer;
}
