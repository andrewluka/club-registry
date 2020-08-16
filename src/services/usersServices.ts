import {
  User,
  UserID,
  UpdateUserNameOptions,
  AddUserOptions,
  UpdateUserPhoneNumberOptions,
  UpdateUserDateOfBirthOptions,
} from "../typings/user";
import { IpcRenderer } from "electron";
import { ErrorWrapper } from "../typings/tables";

const ipcRenderer: IpcRenderer = window.require("electron").ipcRenderer;

export const getAllUsers = (): ErrorWrapper<User[]> =>
  ipcRenderer.sendSync("getAllUsers");

export const removeUser = (user_id: UserID): ErrorWrapper<void> =>
  ipcRenderer.sendSync("removeUser", user_id);

export const getUser = (user_id: UserID): ErrorWrapper<User> =>
  ipcRenderer.sendSync("getUser", user_id);

export const updateUserName = (
  options: UpdateUserNameOptions
): ErrorWrapper<void> => ipcRenderer.sendSync("updateUserName", options);

export const suspendUser = (user_id: UserID): ErrorWrapper<void> =>
  ipcRenderer.sendSync("suspendUser", user_id);

export const unsuspendUser = (user_id: UserID): ErrorWrapper<void> =>
  ipcRenderer.sendSync("unsuspendUser", user_id);

export const addUser = (options: AddUserOptions): ErrorWrapper<void> =>
  ipcRenderer.sendSync("addUser", options);

export const updateUserPhoneNumber = (
  options: UpdateUserPhoneNumberOptions
): ErrorWrapper<void> => ipcRenderer.sendSync("updateUserPhoneNumber", options);

export const updateUserDateOfBirth = (
  options: UpdateUserDateOfBirthOptions
): ErrorWrapper<void> => ipcRenderer.sendSync("updateUserDateOfBirth", options);
