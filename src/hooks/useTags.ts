import { getIpcUsingHook } from "./getIpcUsingHook";
import { GAMES_CHANGED_CHANNEL } from "../constants/tables";
import { getAllGameTags } from "../services/gamesServices";

export const useTags = getIpcUsingHook<string[]>({
  ipcChannels: [GAMES_CHANGED_CHANNEL],
  getData: getAllGameTags,
  defaultValue: [],
});
