import { Settings } from "../typings/settings";
import { IpcRenderer } from "electron";
const ipcRenderer: IpcRenderer = window.require("electron").ipcRenderer;

export const getSettings = (): Settings => ipcRenderer.sendSync("getSettings");

export const updateSettings = (
  getNewSettings: (oldSettings: Settings) => Settings
): boolean =>
  ipcRenderer.sendSync("updateSettings", getNewSettings(getSettings()));
