import { getBooleanInput, getInput, info, setFailed } from "@actions/core";
import { RouteBases, Routes } from "@discloudapp/api-types/v2";
import { resolveFile } from "@discloudapp/util";
import { exec } from "child_process";
import { readFile } from "fs/promises";
import { arch, platform, release, type } from "os";
import { resolve } from "path";
import { parseEnv } from "util";

let _config;
async function getFromConfigFile(prop: string): Promise<string> {
  const filepath = resolve("discloud.config");
  info(`Reading config on: ${filepath}`);
  return (_config ??= parseEnv(await readFile(filepath, "utf8")))[prop];
}

function getUserAgent() {
  const osRelease = release().split?.(".").slice(0, 2).join(".") ?? release();
  return `github-action (${type()} ${osRelease}; ${platform()}; ${arch()})`;
}

async function zip() {
  await new Promise<void>((resolve, reject) => exec("npx -y discloud-cli zip ** --out=out.zip", function (error) {
    if (error) return reject(error);
    resolve();
  }));

  const buffer = await readFile("out.zip");

  return buffer;
}

async function run() {
  const token = getInput("token", { required: true, trimWhitespace: true });

  const appId = getInput("app_id", { trimWhitespace: true }) || await getFromConfigFile("ID");

  if (!appId) throw new Error("Application ID is missing");

  info(`app id: ${appId}`);

  const buffer = await zip();

  info(`zip size: ${buffer.length}`);

  const formData = new FormData();
  formData.append("file", await resolveFile(buffer));

  const appIsTeam = getBooleanInput("team");

  const route = appIsTeam ? Routes.teamCommit(appId) : Routes.appCommit(appId);

  const response = await fetch(RouteBases.api + route, {
    method: "PUT",
    body: formData,
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
