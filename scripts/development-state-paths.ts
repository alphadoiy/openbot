import { homedir } from "node:os";
import { dirname, posix } from "node:path";
import { fileURLToPath } from "node:url";
import { DISTRIBUTION } from "@openbot/contracts/distribution";
import { localDevelopmentProfileRoot } from "../src/main/development-profile";

const defaultProjectRoot = dirname(dirname(fileURLToPath(import.meta.url)));

export function resolveDevelopmentAppDataRoot(
  platform: NodeJS.Platform = process.platform,
  environment: NodeJS.ProcessEnv = process.env,
  homeDirectory = homedir(),
  projectRoot = defaultProjectRoot,
): string {
  if (!DISTRIBUTION.accountEnabled) return localDevelopmentProfileRoot(projectRoot, environment);
  if (platform === "darwin") {
    return posix.join(homeDirectory, "Library", "Application Support");
  }

  if (platform === "win32") {
    const appData = environment.APPDATA?.trim();
    if (!appData) {
      throw new Error("APPDATA is not set. OpenBot dev state was not changed.");
    }
    return appData;
  }

  return environment.XDG_CONFIG_HOME?.trim() || posix.join(homeDirectory, ".config");
}
