import { expect } from "chai";
import SettingsService from "./SettingsService";
import tempDirectory from "temp-dir";
import { join } from "path";
import { writeFileSync } from "fs";

test("SettingsService#settingsPath is correct", () => {
  const settingsDirPath = tempDirectory;
  const settingsFileName =
    "temp-" + Math.random().toString().replace(/\./g, "") + ".json";

  const settingsPath = join(settingsDirPath, settingsFileName);
  const settingsService = new SettingsService(settingsPath);

  expect(settingsService.settingsPath).to.equal(settingsPath);
});

test("SettingsService#getSettings gets settings", () => {
  const settingsDirPath = tempDirectory;
  const settingsFileName =
    "temp-" + Math.random().toString().replace(/\./g, "") + ".json";

  const settingsPath = join(settingsDirPath, settingsFileName);
  const settingsService = new SettingsService(settingsPath);

  expect(settingsService.getSettings()).to.deep.equal({});

  const expectedSettings = { someOptionA: "some value" };
  writeFileSync(settingsPath, JSON.stringify(expectedSettings));

  expect(settingsService.getSettings()).to.deep.equal(expectedSettings);
});

test("SettingsService#updateSettings updates settings correctly", () => {
  const settingsDirPath = tempDirectory;
  const settingsFileName =
    "temp-" + Math.random().toString().replace(/\./g, "") + ".json";

  const settingsPath = join(settingsDirPath, settingsFileName);
  const settingsService = new SettingsService(settingsPath);

  settingsService.updateSettings({});
  expect(settingsService.getSettings()).to.deep.equal({});

  const oldSettings = { a: { b: "C" } };
  settingsService.updateSettings(oldSettings);
  expect(settingsService.getSettings()).to.deep.equal(oldSettings);

  const newSettings = { a: { b: "C", d: "E" } };
  settingsService.updateSettings((oldSettings) => ({
    ...oldSettings,
    a: { ...oldSettings.a, d: "E" },
  }));
  expect(settingsService.getSettings()).to.deep.equal(newSettings);
});
