import { debug, info } from "@actions/core";
import { DiscloudConfig } from "@discloudapp/util";
import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { resolve } from "path";
import { inspect, parseEnv } from "util";

let _config: any;
export async function getConfigFile(): Promise<Record<string, string>> {
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

export async function getPropertyFromConfigFile(prop: string): Promise<string> {
  const config = await getConfigFile();
  return config[prop];
}
