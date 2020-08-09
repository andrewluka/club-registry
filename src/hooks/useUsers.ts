import { getAllUsers } from "../services/usersServices";
import { getIpcUsingHook } from "./getIpcUsingHook";
import { USERS_CHANGED_CHANNEL } from "../constants/tables";

const channel = USERS_CHANGED_CHANNEL;

export const useUsers = getIpcUsingHook({
  getData: getAllUsers,
  ipcChannels: [channel],
});
