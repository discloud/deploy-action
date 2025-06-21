import { debug, info, setFailed, warning } from "@actions/core";
import { type RESTPutApiAppCommitResult, RouteBases, Routes } from "@discloudapp/api-types/v2";
import { writeFile } from "fs/promises";
import { arch, platform, release, type } from "os";
import { getInputs } from "./inputs";
import zip from "./zip";

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
  const inputs = await getInputs();

  if (inputs.env) {
    const content = inputs.env.join("\n");
    await writeFile(".env", content, "utf8");
  }

  const buffer = await zip(inputs.glob);

  const file = new File([buffer], "file.zip");

  const body = new FormData();
  body.append(file.name, file);

  const route = inputs.team ? Routes.teamCommit(inputs.appId) : Routes.appCommit(inputs.appId);

  const response = await fetch(RouteBases.api + route, {
    body,
    headers: {
      "api-token": inputs.token,
      "User-Agent": getUserAgent(),
    },
    method: "PUT",
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
