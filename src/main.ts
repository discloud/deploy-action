import { getBooleanInput, getInput, setFailed } from "@actions/core";
import { RouteBases, Routes } from "@discloudapp/api-types/v2";
import { resolveFile } from "@discloudapp/util";
import { exec } from "child_process";
import { readFile, rm } from "fs/promises";
import { arch, platform, release, type } from "os";
import { parseEnv } from "util";

let _config;
async function getFromConfigFile(prop: string): Promise<string> {
  return (_config ??= parseEnv(await readFile("discloud.config", "utf8")))[prop];
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

  await rm("out.zip").catch(() => null);

  return buffer;
}

async function run() {
  const token = getInput("token", { required: true, trimWhitespace: true });

  const appId = getInput("app_id", { trimWhitespace: true }) || await getFromConfigFile("ID");

  if (!appId) throw new Error("Application ID is missing");

  const buffer = await zip();

  const formData = new FormData();
  formData.append("file", await resolveFile(buffer));

  const appIsTeam = getBooleanInput("team") || false;

  const route = appIsTeam ? Routes.teamCommit(appId) : Routes.appCommit(appId);

  await fetch(RouteBases.api + route, {
    body: formData,
    headers: {
      "api-token": token,
      "User-Agent": getUserAgent(),
    },
  });
}

export default async function () {
  try {
    await run();
  } catch (error: any) {
    setFailed(error.message);
  }
}
