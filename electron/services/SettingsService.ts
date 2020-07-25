import { existsSync, writeFileSync, readFileSync } from "fs";

type SettingsUpdater = <T extends Record<string | number, any>>(
  oldSettings: Partial<T>
) => Partial<T>;

export default class SettingsService<T extends Record<string | number, any>> {
  constructor(public readonly settingsPath: string) {}

  private _initializeSettingsIfTheyDontExist = (): void => {
    if (!existsSync(this.settingsPath)) {
      writeFileSync(this.settingsPath, JSON.stringify({}));
    }
  };

  updateSettings = (newSettings: Partial<T> | SettingsUpdater): Partial<T> => {
    this._initializeSettingsIfTheyDontExist();

    const oldSettings = JSON.parse(readFileSync(this.settingsPath).toString());

    const getNewSettings = () => {
      if (typeof newSettings === "object") {
        return { ...oldSettings, ...newSettings };
      } else if (typeof newSettings === "function") {
        return newSettings(oldSettings);
      } else {
        throw new TypeError(
          "first argument must be either an object or function"
        );
      }
    };

    const stringifiedNewSettings = JSON.stringify(getNewSettings());

    writeFileSync(this.settingsPath, stringifiedNewSettings);

    return JSON.parse(stringifiedNewSettings);
  };

  getSettings = (): Partial<T> => {
    this._initializeSettingsIfTheyDontExist();

    const stringifiedSettings = readFileSync(this.settingsPath).toString();

    return JSON.parse(stringifiedSettings);
  };
}
