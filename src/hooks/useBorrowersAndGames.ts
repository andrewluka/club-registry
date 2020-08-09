import { getBorrowersAndGames } from "../services/tablesServices";
import { getIpcUsingHook } from "./getIpcUsingHook";
import {
  USERS_CHANGED_CHANNEL,
  GAMES_CHANGED_CHANNEL,
} from "../constants/tables";

export const useBorrowersAndGames = getIpcUsingHook({
  getData: getBorrowersAndGames,
  ipcChannels: [USERS_CHANGED_CHANNEL, GAMES_CHANGED_CHANNEL],
});
