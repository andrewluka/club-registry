import { UserID, User } from "../../typings/user";
import {
  GameID,
  Game,
  AddGameOptions,
  UpdateGameNameOptions,
} from "../../typings/game";

const electron = window.require("electron");
const { ipcRenderer } = electron;

interface BorrowerAndGame {
  game_id: GameID;
  user_id: UserID;

  game_name: string;
  user_name: string;
}

export const getBorrowersAndGames = (): BorrowerAndGame[] =>
  ipcRenderer.sendSync("getBorrowersAndGames");

export const getAllUsers = (): User[] => ipcRenderer.sendSync("getAllUsers");

export const getAllGames = (): Game[] => ipcRenderer.sendSync("getAllGames");

export const suspendGame = (game_id: GameID): boolean =>
  ipcRenderer.sendSync("suspendGame", game_id);

export const unsuspendGame = (game_id: GameID): boolean =>
  ipcRenderer.sendSync("unsuspendGame", game_id);

export const removeGame = (game_id: GameID): boolean =>
  ipcRenderer.sendSync("removeGame", game_id);

export const addGame = (options: AddGameOptions): GameID | false =>
  ipcRenderer.sendSync("addGame", options);

export const updateGameName = (options: UpdateGameNameOptions): boolean =>
  ipcRenderer.sendSync("updateGameName", options);

export const getGame = (game_id: number) =>
  ipcRenderer.sendSync("getGame", game_id);
