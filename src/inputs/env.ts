import { getMultilineInput } from "@actions/core";

export function getEnvInput() {
  const env = getMultilineInput("env");
  if (env.length) return env;
}