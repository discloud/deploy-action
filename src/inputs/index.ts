import { getAppIdInput } from "./appId";
import { getEnvInput } from "./env";
import { getEnvFileInput } from "./envFile";
import { getGlobInput } from "./glob";
import { getTeamInput } from "./team";
import { getTokenInput } from "./token";

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
