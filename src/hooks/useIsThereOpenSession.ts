import { getIpcUsingHook } from "./getIpcUsingHook";
import { isThereOpenSession } from "../services/attendanceServices";
import { SESSIONS_CHANNEL_CHANGED } from "../constants/tables";

export const useIsThereOpenSession = getIpcUsingHook<boolean>({
  getData: isThereOpenSession,
  defaultValue: false,
  ipcChannels: [SESSIONS_CHANNEL_CHANGED],
});
