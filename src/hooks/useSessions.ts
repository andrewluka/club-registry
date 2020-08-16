import { getIpcUsingHook } from "./getIpcUsingHook";
import { getAllSessions } from "../services/attendanceServices";
import { SESSIONS_CHANNEL_CHANGED } from "../constants/tables";

export const useSessions = getIpcUsingHook({
  getData: getAllSessions,
  ipcChannels: [SESSIONS_CHANNEL_CHANGED],
  defaultValue: [],
});
