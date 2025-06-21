import { getBooleanInput } from "@actions/core";

export function getTeamInput() {
  return getBooleanInput("team");
}
