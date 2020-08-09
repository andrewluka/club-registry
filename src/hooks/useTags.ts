import { getIpcUsingHook } from "./getIpcUsingHook";
import { GAMES_CHANGED_CHANNEL } from "../constants/tables";
import { getAllGameTags } from "../services/gamesServices";

export const useTags = getIpcUsingHook({
  ipcChannels: [GAMES_CHANGED_CHANNEL],
  getData: getAllGameTags,
});
