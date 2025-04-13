import { debug, notice } from "@actions/core";
import { getExecOutput } from "@actions/exec";
import bytes from "bytes";

export default async function zip(glob?: string | string[]) {
  if (Array.isArray(glob)) glob = glob.join(" ");

  const encoding = "base64";
  const zipCommand = "discloud zip";

  const output = await getExecOutput("npx", [
    "-y",
    "discloud-cli@latest",
    "zip",
    `-e=${encoding}`,
    `${glob || "**"}`,
  ], {
    listeners: { debug },
    silent: true,
  });

  const parts = output.stdout.split("\n");

  const buffer = Buffer.from(parts[parts[0].includes(zipCommand) ? 1 : 0], encoding);

  notice(`Zip size: ${bytes(buffer.length)}`);

  return buffer;
}
