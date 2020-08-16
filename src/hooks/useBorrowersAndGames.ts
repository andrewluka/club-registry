import { getCurrentBorrowersAndGames } from "../services/tablesServices";
import { getIpcUsingHook } from "./getIpcUsingHook";
import {
  USERS_CHANGED_CHANNEL,
  GAMES_CHANGED_CHANNEL,
} from "../constants/tables";
import { BorrowerAndGame } from "../typings/statistics";

export const useBorrowersAndGames = getIpcUsingHook<BorrowerAndGame[]>({
  getData: getCurrentBorrowersAndGames,
  ipcChannels: [USERS_CHANGED_CHANNEL, GAMES_CHANGED_CHANNEL],
  defaultValue: [],
});
