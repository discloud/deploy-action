import { getInput } from "@actions/core";

export function getTokenInput() {
  return getInput("token", { required: true });
}