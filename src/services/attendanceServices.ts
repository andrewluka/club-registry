import { IpcRenderer } from "electron";
import { UserID } from "../typings/user";
import { AttendanceRecord, SessionID, Session } from "../typings/attendance";
import { ErrorWrapper } from "../typings/tables";

const ipcRenderer: IpcRenderer = window.require("electron").ipcRenderer;

export const closeSession = (): ErrorWrapper<SessionID> =>
  ipcRenderer.sendSync("closeSession");

export const markUserForCurrentSession = (
  user_id: UserID
): ErrorWrapper<void> =>
  ipcRenderer.sendSync("markUserForCurrentSession", user_id);

export const startSession = (): ErrorWrapper<void> =>
  ipcRenderer.sendSync("startSession");

export const isThereOpenSession = (): ErrorWrapper<boolean> =>
  ipcRenderer.sendSync("isThereOpenSession");

export const getUserAttendanceData = (
  user_id: UserID
): ErrorWrapper<AttendanceRecord[]> =>
  ipcRenderer.sendSync("getUserAttendanceData", user_id);

export const getSession = (
  session_id: SessionID
): ErrorWrapper<Session | undefined> =>
  ipcRenderer.sendSync("getSession", session_id);

export const getCurrentSession = (): ErrorWrapper<Session | undefined> =>
  ipcRenderer.sendSync("getCurrentSession");

export const getAllAttendanceData = (): ErrorWrapper<AttendanceRecord[]> =>
  ipcRenderer.sendSync("getAllAttendanceData");

export const getAllSessions = (): ErrorWrapper<Session[]> =>
  ipcRenderer.sendSync("getAllSessions");
