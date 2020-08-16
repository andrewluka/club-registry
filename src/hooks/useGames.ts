import { getAllGames } from "../services/gamesServices";
import { getIpcUsingHook } from "./getIpcUsingHook";
import { GAMES_CHANGED_CHANNEL } from "../constants/tables";
import { Game } from "../typings/game";

const channel = GAMES_CHANGED_CHANNEL;

export const useGames = getIpcUsingHook<Game[]>({
  getData: getAllGames,
  ipcChannels: [channel],
  defaultValue: [],
});
