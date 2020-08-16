import { join } from "path";

const getAppDataDir = () => {
  return join(
    process.env.APPDATA ||
      (process.platform == "darwin"
        ? process.env.HOME + "/Library/Preferences"
        : process.env.HOME + "/.local/share"),
    "club-registry"
  );
};

export default getAppDataDir;
