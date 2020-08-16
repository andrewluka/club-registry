import {
  GameID,
  Game,
  AddGameOptions,
  UpdateGameNameOptions,
  BorrowAndReturnGameOptions,
  UpdateGameTagsOptions,
} from "../typings/game";
import { IpcRenderer } from "electron";
import { ErrorWrapper } from "../typings/tables";

const ipcRenderer: IpcRenderer = window.require("electron").ipcRenderer;

export const getAllGames = (): ErrorWrapper<Game[]> =>
  ipcRenderer.sendSync("getAllGames");

export const getGame = (game_id: number): ErrorWrapper<Game | undefined> =>
  ipcRenderer.sendSync("getGame", game_id);

export const suspendGame = (game_id: GameID): ErrorWrapper<void> =>
  ipcRenderer.sendSync("suspendGame", game_id);

export const unsuspendGame = (game_id: GameID): ErrorWrapper<void> =>
  ipcRenderer.sendSync("unsuspendGame", game_id);

export const removeGame = (game_id: GameID): ErrorWrapper<void> =>
  ipcRenderer.sendSync("removeGame", game_id);

export const addGame = (options: AddGameOptions): ErrorWrapper<void> =>
  ipcRenderer.sendSync("addGame", options);

export const updateGameName = (
  options: UpdateGameNameOptions
): ErrorWrapper<void> => ipcRenderer.sendSync("updateGameName", options);

export const borrowGame = (
  options: BorrowAndReturnGameOptions
): ErrorWrapper<void> => ipcRenderer.sendSync("borrowGame", options);

export const returnGame = (
  options: BorrowAndReturnGameOptions
): ErrorWrapper<void> => ipcRenderer.sendSync("returnGame", options);

export const updateGameTags = (
  options: UpdateGameTagsOptions
): ErrorWrapper<void> => ipcRenderer.sendSync("updateGameTags", options);

export const getAllGameTags = (): ErrorWrapper<string[]> =>
  ipcRenderer.sendSync("getAllGameTags");
