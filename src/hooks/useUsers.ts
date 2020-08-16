import { getAllUsers } from "../services/usersServices";
import { getIpcUsingHook } from "./getIpcUsingHook";
import { USERS_CHANGED_CHANNEL } from "../constants/tables";
import { User } from "../typings/user";

const channel = USERS_CHANGED_CHANNEL;

export const useUsers = getIpcUsingHook<User[]>({
  getData: getAllUsers,
  ipcChannels: [channel],
  defaultValue: [],
});
