import { getAllGames } from "../services/gamesServices";
import { getIpcUsingHook } from "./getIpcUsingHook";
import { GAMES_CHANGED_CHANNEL } from "../constants/tables";

const channel = GAMES_CHANGED_CHANNEL;

export const useGames = getIpcUsingHook({
  getData: getAllGames,
  ipcChannels: [channel],
});
