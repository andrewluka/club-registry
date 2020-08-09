import { UserID } from "../typings/user";
import { GameID } from "../typings/game";
import { IpcRenderer } from "electron";

const ipcRenderer: IpcRenderer = window.require("electron").ipcRenderer;

interface BorrowerAndGame {
  game_id: GameID;
  user_id: UserID;

  game_name: string;
  user_name: string;
}

export const getBorrowersAndGames = (): BorrowerAndGame[] =>
  ipcRenderer.sendSync("getBorrowersAndGames");
