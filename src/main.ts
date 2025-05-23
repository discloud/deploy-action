import { debug, getBooleanInput, getInput, getMultilineInput, info, setFailed, warning } from "@actions/core";
import { type RESTPutApiAppCommitResult, RouteBases, Routes } from "@discloudapp/api-types/v2";
import { DiscloudConfig } from "@discloudapp/util";
import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { arch, platform, release, type } from "os";
import { resolve } from "path";
import { inspect, parseEnv } from "util";
import zip from "./zip";

let _config: any;
async function getConfigFile(): Promise<Record<string, string>> {
  if (_config) {
    info("Config file found on cache");
    debug(`Cached config content: ${inspect(_config)}`);
    return _config;
  }

  const configPath = resolve(DiscloudConfig.filename);

  info("Searching for config file");

  if (!existsSync(configPath)) throw new Error("Config file not found");

  info(`Config file found on: ${configPath}`);

  _config = parseEnv(await readFile(configPath, "utf8"));

  debug(`Readed config content: ${inspect(_config)}`);

  return _config;
}

async function getPropertyFromConfigFile(prop: string): Promise<string> {
  const config = await getConfigFile();
  return config[prop];
}

async function getAppIdInput() {
  let appId = getInput("app_id");
  if (appId) return appId;

  info("App ID not provided in input");

  appId = await getPropertyFromConfigFile("ID");

  if (!appId) throw new Error("App ID is missing");

  info(`App ID: ${appId}`);

  return appId;
}

function getGlobInput() {
  const glob = getMultilineInput("glob");

  debug(`Glob pattern provided: ${glob}`);

  return glob;
}

let _userAgent: any;
function getUserAgent(): string {
  if (_userAgent) {
    debug(`Using cached user agent: ${_userAgent}`);
    return _userAgent;
  }

  const osRelease = release().split(".").slice(0, 2).join(".");
  _userAgent = `github-deploy-action (${type()} ${osRelease}; ${platform()}; ${arch()})`;

  debug(`Using user agent: ${_userAgent}`);

  return _userAgent;
}

async function run() {
  const token = getInput("token", { required: true });

  const appId = await getAppIdInput();

  const glob = getGlobInput();

  const buffer = await zip(glob);

  const file = new File([buffer], "file.zip");

  const body = new FormData();
  body.append(file.name, file);

  const appIsTeam = getBooleanInput("team");

  const route = appIsTeam ? Routes.teamCommit(appId) : Routes.appCommit(appId);

  const response = await fetch(RouteBases.api + route, {
    method: "PUT",
    body,
    headers: {
      "api-token": token,
      "User-Agent": getUserAgent(),
    },
  });

  const responseBody = await resolveResponseBody<RESTPutApiAppCommitResult>(response);

  const responseStatus = responseBody.statusCode || response.status;
  const responseMessage = responseBody.message || response.statusText;

  const message = `[DISCLOUD API: ${responseStatus}] ${responseMessage}`;

  if (response.ok) { info(message); }
  else { setFailed(message); }

  if (responseBody?.logs) warning(responseBody.logs);
}

async function resolveResponseBody<T>(response: Response): Promise<T>
async function resolveResponseBody(response: Response) {
  const contentType = response.headers.get("content-type");

  if (typeof contentType === "string") {
    if (contentType.includes("application/json")) {
      const body = await response.json() as any;
      if (typeof body === "object" && body !== null)
        body.statusCode ??= response.status;
      return body;
    }

    if (contentType.includes("text/"))
      return response.text();
  }

  return response.arrayBuffer();
}

export default async function () {
  try {
    await run();
  } catch (error: any) {
    setFailed(error.message);
  }
}
