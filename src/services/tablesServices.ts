import { IpcRenderer } from "electron";
import { BorrowerAndGame } from "../typings/statistics";
import { ErrorWrapper } from "../typings/tables";

const ipcRenderer: IpcRenderer = window.require("electron").ipcRenderer;

export const getCurrentBorrowersAndGames = (): ErrorWrapper<
  BorrowerAndGame[]
> => ipcRenderer.sendSync("getCurrentBorrowersAndGames");
