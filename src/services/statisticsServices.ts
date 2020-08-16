import { IpcRenderer } from "electron";
import {
  BorrowingAndGameData,
  BorrowingID,
  StatisticsFilter,
  GameStatistics,
  UserStatistics,
} from "../typings/statistics";
import { GameID } from "../typings/game";
import { UserID } from "../typings/user";
import { ErrorWrapper } from "../typings/tables";

const ipcRenderer: IpcRenderer = window.require("electron").ipcRenderer;

export const getAllBorrowings = (): ErrorWrapper<BorrowingAndGameData[]> =>
  ipcRenderer.sendSync("getAllBorrowings");

export const getBorrowing = (
  borrowing_id: BorrowingID
): ErrorWrapper<BorrowingAndGameData | undefined> =>
  ipcRenderer.sendSync("getBorrowing", borrowing_id);

export const getGameBorrowings = (
  game_id: GameID
): ErrorWrapper<BorrowingAndGameData[]> =>
  ipcRenderer.sendSync("getGameBorrowings", game_id);

export const getGameStatistics = (
  game_id: GameID,
  filterForWholeStatistics?: StatisticsFilter
): ErrorWrapper<GameStatistics> =>
  ipcRenderer.sendSync("getGameStatistics", game_id, filterForWholeStatistics);

export const getTagsCount = (
  filterForWholeStatistics?: StatisticsFilter
): ErrorWrapper<Record<string, number>> =>
  ipcRenderer.sendSync("getTagsCount", filterForWholeStatistics);

export const getUserBorrowings = (
  user_id: UserID
): ErrorWrapper<BorrowingAndGameData[]> =>
  ipcRenderer.sendSync("getUserBorrowings", user_id);

export const getUserStatistics = (
  user_id: UserID,
  filterForWholeStatistics?: StatisticsFilter
): ErrorWrapper<UserStatistics> =>
  ipcRenderer.sendSync("getUserStatistics", user_id, filterForWholeStatistics);
