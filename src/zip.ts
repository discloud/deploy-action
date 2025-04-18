import { debug, notice } from "@actions/core";
import { getExecOutput } from "@actions/exec";
import bytes from "bytes";
import { MAX_ZIP_SIZE } from "./constants";

export default async function zip(glob?: string | string[]) {
  if (!glob) glob = ["**"];
  if (!Array.isArray(glob)) glob = [glob];

  const encoding = "base64";
  const zipCommand = "discloud zip";

  const output = await getExecOutput("npx", [
    "-y",
    "discloud-cli@latest",
    "zip",
    `-e=${encoding}`,
    ...glob,
  ], {
    listeners: { debug },
    silent: true,
  });

  const parts = output.stdout.split("\n");

  const buffer = Buffer.from(parts[parts[0].includes(zipCommand) ? 1 : 0], encoding);

  if (buffer.length > MAX_ZIP_SIZE)
    throw new Error(`The ZIP size cannot exceed 100 MB (1048576 KB). ZIP size: ${bytes(buffer.length)}`);

  notice(`ZIP size: ${bytes(buffer.length)}`);

  return buffer;
}
