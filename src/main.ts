import { getBooleanInput, getInput, info, notice, setFailed } from "@actions/core";
import { getExecOutput } from "@actions/exec";
import { RouteBases, Routes } from "@discloudapp/api-types/v2";
import { resolveFile } from "@discloudapp/util";
import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { arch, platform, release, type } from "os";
import { resolve } from "path";
import { parseEnv } from "util";

let _config: any;
async function getFromConfigFile(prop: string): Promise<string> {
  if (_config) {
    notice("Config file found on cache");
    return _config[prop];
  }

  const configPath = resolve("discloud.config");

  notice("Searching for config file");

  if (!existsSync(configPath)) throw new Error("Config file not found");

  notice(`Config file found on: ${configPath}`);

  return (_config ??= parseEnv(await readFile(configPath, "utf8")))[prop];
}

async function getAppIdInput() {
  const appId = getInput("app_id", { trimWhitespace: true });
  if (appId) return appId;

  notice("App ID not provided in input");

  return await getFromConfigFile("ID");
}

function getUserAgent() {
  const osRelease = release().split?.(".").slice(0, 2).join(".") ?? release();
  return `github-deploy-action (${type()} ${osRelease}; ${platform()}; ${arch()})`;
}

async function zip(glob?: string | string[]) {
  if (Array.isArray(glob)) glob = glob.join(" ");

  const encoding = "base64";
  const zipCommand = "discloud zip";

  const output = await getExecOutput(`npx -y discloud-cli@latest zip -e=${encoding} ${glob || "**"}`);

  const parts = output.stdout.split("\n");

  return Buffer.from(parts[parts[0].includes(zipCommand) ? 1 : 0], encoding);
}

async function run() {
  const token = getInput("token", { required: true, trimWhitespace: true });

  const appId = await getAppIdInput();

  if (!appId) throw new Error("App ID is missing");

  info(`App ID: ${appId}`);

  const buffer = await zip();

  info(`Zip size: ${buffer.length}B`);

  const file = await resolveFile(buffer, "file.zip");

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

  if (!response.ok) {
    const body = await resolveResponseBody(response);

    setFailed(`${body.statusCode} ${body.message ?? response.statusText}`);
  }
}

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
