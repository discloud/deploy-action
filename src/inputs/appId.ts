import { getInput, info } from "@actions/core";
import { getPropertyFromConfigFile } from "../config";

export async function getAppIdInput() {
  let appId = getInput("app_id");
  if (appId) return appId;

  info("App ID not provided in input");

  appId = await getPropertyFromConfigFile("ID");

  if (!appId) throw new Error("App ID is missing");

  info(`App ID: ${appId}`);

  return appId;
}
