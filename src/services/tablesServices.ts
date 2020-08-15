import { IpcRenderer } from "electron";
import { BorrowerAndGame } from "../typings/statistics";

const ipcRenderer: IpcRenderer = window.require("electron").ipcRenderer;

export const getCurrentBorrowersAndGames = (): BorrowerAndGame[] =>
  ipcRenderer.sendSync("getCurrentBorrowersAndGames");
