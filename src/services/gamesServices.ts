import {
  GameID,
  Game,
  AddGameOptions,
  UpdateGameNameOptions,
  BorrowAndReturnGameOptions,
  UpdateGameTagsOptions,
} from "../typings/game";
import { IpcRenderer } from "electron";

const ipcRenderer: IpcRenderer = window.require("electron").ipcRenderer;

export const getAllGames = (): Game[] => ipcRenderer.sendSync("getAllGames");

export const getGame = (game_id: number): Game | undefined =>
  ipcRenderer.sendSync("getGame", game_id);

export const suspendGame = (game_id: GameID): boolean =>
  ipcRenderer.sendSync("suspendGame", game_id);

export const unsuspendGame = (game_id: GameID): boolean =>
  ipcRenderer.sendSync("unsuspendGame", game_id);

export const removeGame = (game_id: GameID): boolean =>
  ipcRenderer.sendSync("removeGame", game_id);

export const addGame = (options: AddGameOptions): boolean =>
  ipcRenderer.sendSync("addGame", options);

export const updateGameName = (options: UpdateGameNameOptions): boolean =>
  ipcRenderer.sendSync("updateGameName", options);

export const borrowGame = (options: BorrowAndReturnGameOptions): boolean =>
  ipcRenderer.sendSync("borrowGame", options);

export const returnGame = (options: BorrowAndReturnGameOptions): boolean =>
  ipcRenderer.sendSync("returnGame", options);

export const updateGameTags = (options: UpdateGameTagsOptions): boolean =>
  ipcRenderer.sendSync("updateGameTags", options);

export const getAllGameTags = (): string[] =>
  ipcRenderer.sendSync("getAllGameTags");
