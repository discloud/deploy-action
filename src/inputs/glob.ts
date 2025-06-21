import { debug, getMultilineInput } from "@actions/core";

export function getGlobInput() {
  const glob = getMultilineInput("glob");

  debug(`Glob pattern provided: ${glob}`);

  return glob;
}
