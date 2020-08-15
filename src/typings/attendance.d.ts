import { UserID } from "./user";

export type SessionID = number;

export interface Session {
  session_id: SessionID;
  session_start: number;
  session_end?: number | null;
}

export interface AttendanceRecord {
  attendee: UserID;
  session: SessionID;
  attendee_arrival_datetime: number;
}
