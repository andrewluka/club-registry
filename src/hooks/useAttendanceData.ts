import { getIpcUsingHook } from "./getIpcUsingHook";
import { getAllAttendanceData } from "../services/attendanceServices";
import { AttendanceRecord } from "../typings/attendance";
import { ATTENDANCE_CHANNEL_CHANGED } from "../constants/tables";

export const useAttendanceData = getIpcUsingHook<AttendanceRecord[]>({
  getData: getAllAttendanceData,
  ipcChannels: [ATTENDANCE_CHANNEL_CHANGED],
  defaultValue: [],
});
