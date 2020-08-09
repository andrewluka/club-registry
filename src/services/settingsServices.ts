import { Settings } from "../typings/settings";
const { ipcRenderer } = window.require("electron");

export const getSettings = (): Settings => ipcRenderer.sendSync("getSettings");
