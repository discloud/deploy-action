import { getInput } from "@actions/core";

export function getEnvFileInput() {
  return getInput("env_file");
}