import { getAppIdInput } from "./appId";
import { getEnvInput } from "./env";
import { getGlobInput } from "./glob";
import { getTeamInput } from "./team";
import { getTokenInput } from "./token";

export async function getInputs() {
  return {
    appId: await getAppIdInput(),
    env: getEnvInput(),
    glob: getGlobInput(),
    team: getTeamInput(),
    token: getTokenInput(),
  };
}
