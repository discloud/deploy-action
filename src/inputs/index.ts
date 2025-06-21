import { getAppIdInput } from "./appId";
import { getGlobInput } from "./glob";
import { getTeamInput } from "./team";
import { getTokenInput } from "./token";

export async function getInputs() {
  return {
    appId: await getAppIdInput(),
    glob: getGlobInput(),
    team: getTeamInput(),
    token: getTokenInput(),
  };
}
