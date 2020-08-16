import { Settings } from "../typings/settings";
import { IpcRenderer } from "electron";
import { ErrorWrapper } from "../typings/tables";
const ipcRenderer: IpcRenderer = window.require("electron").ipcRenderer;

export const getSettings = (): ErrorWrapper<Settings> =>
  ipcRenderer.sendSync("getSettings");

export const updateSettings = (
  getNewSettings: (oldSettings: Settings) => Settings
): ErrorWrapper<void> => {
  const oldSettingsResponse = getSettings();

  if (oldSettingsResponse.isError) return oldSettingsResponse as any;

  const newSettings = getNewSettings(oldSettingsResponse.payload as any);

  return ipcRenderer.sendSync("updateSettings", newSettings);
};
