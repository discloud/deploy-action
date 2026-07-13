import { getAppIdInput } from "./appId.js";
import { getEnvInput } from "./env.js";
import { getEnvFileInput } from "./envFile.js";
import { getGlobInput } from "./glob.js";
import { getTeamInput } from "./team.js";
import { getTokenInput } from "./token.js";

export async function getInputs() {
  return {
    appId: await getAppIdInput(),
    env: getEnvInput(),
    envFile: getEnvFileInput(),
    glob: getGlobInput(),
    team: getTeamInput(),
    token: getTokenInput(),
  };
}
