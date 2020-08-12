import {
  User,
  UserID,
  UpdateUserNameOptions,
  AddUserOptions,
  UpdateUserPhoneNumberOptions,
  UpdateUserDateOfBirthOptions,
} from "../typings/user";
import { IpcRenderer } from "electron";

const ipcRenderer: IpcRenderer = window.require("electron").ipcRenderer;

export const getAllUsers = (): User[] => ipcRenderer.sendSync("getAllUsers");

export const removeUser = (user_id: UserID): boolean =>
  ipcRenderer.sendSync("removeUser", user_id);

export const getUser = (user_id: UserID): User =>
  ipcRenderer.sendSync("getUser", user_id);

export const updateUserName = (options: UpdateUserNameOptions): boolean =>
  ipcRenderer.sendSync("updateUserName", options);

export const suspendUser = (user_id: UserID): boolean =>
  ipcRenderer.sendSync("suspendUser", user_id);

export const unsuspendUser = (user_id: UserID): boolean =>
  ipcRenderer.sendSync("unsuspendUser", user_id);

export const addUser = (options: AddUserOptions): boolean =>
  ipcRenderer.sendSync("addUser", options);

export const updateUserPhoneNumber = (
  options: UpdateUserPhoneNumberOptions
): boolean => ipcRenderer.sendSync("updateUserPhoneNumber", options);

export const updateUserDateOfBirth = (
  options: UpdateUserDateOfBirthOptions
): boolean => ipcRenderer.sendSync("updateUserDateOfBirth", options);
