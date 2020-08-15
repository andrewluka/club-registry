import { expect } from "chai";
import SettingsService from "./SettingsService";
import tempDirectory from "temp-dir";
import { join } from "path";
import { writeFileSync } from "fs";

describe("SettingsService", function () {
  describe("#settingsPath", function () {
    it("should be equal to the supplied path on instantiation", function () {
      const settingsDirPath = tempDirectory;
      const settingsFileName =
        "temp-" + Math.random().toString().replace(/\./g, "") + ".json";

      const settingsPath = join(settingsDirPath, settingsFileName);
      const settingsService = new SettingsService(settingsPath);

      expect(settingsService.settingsPath).to.equal(settingsPath);
    });
  });

  describe("#getSettings", function () {
    it("should get correct settings", function () {
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
  });

  describe("#updateSettings", function () {
    it("should correctly update settings", function () {
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
  });
});
