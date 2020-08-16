import { Database } from "better-sqlite3";
import TablesService from "./TablesService";
import {
  Session,
  AttendanceRecord,
  SessionID,
} from "../../src/typings/attendance";
import { UserID } from "../../src/typings/user";
import getAppDataDir from "../utils/getAppDataDir";
import { join } from "path";
import { readFileSync, existsSync, writeFileSync } from "fs";

const isSessionOpenCacheFilePath = join(getAppDataDir(), "isThereOpenSession");

export default class AttendanceService {
  constructor(private db: Database) {
    const tablesService = new TablesService(this.db);
    tablesService.createTables();
  }

  startSession = (): SessionID => {
    writeFileSync(isSessionOpenCacheFilePath, String(true));

    return Number(
      this.db.prepare("INSERT INTO sessions DEFAULT VALUES").run()
        .lastInsertRowid
    );
  };

  closeSession = (): SessionID => {
    const currentSession = this.getCurrentSession();

    if (!currentSession) throw new Error("No open sessions found");

    writeFileSync(isSessionOpenCacheFilePath, String(false));

    return Number(
      this.db
        .prepare(
          `UPDATE sessions SET session_end = @session_end 
            WHERE session_id = @session_id`
        )
        .run({
          session_end: Date.now(),
          session_id: currentSession.session_id,
        }).lastInsertRowid
    );
  };

  getSession = (session_id: SessionID): Session | undefined =>
    this.db
      .prepare("SELECT * FROM sessions WHERE session_id = ?")
      .all(session_id)[0];

  getCurrentSession = (): Session | undefined =>
    this.db
      .prepare("SELECT * FROM sessions WHERE session_end IS NULL")
      .all()[0];

  isThereOpenSession = () => {
    const filePath = isSessionOpenCacheFilePath;

    if (!existsSync(filePath)) {
      const isSessionOpen = Boolean(this.getCurrentSession());
      writeFileSync(filePath, String(isSessionOpen));
      return isSessionOpen;
    }

    return readFileSync(filePath).toString() === "true" ? true : false;
  };

  getAllAttendanceData = (): AttendanceRecord[] =>
    this.db.prepare("SELECT * FROM attendance").all();

  getUserAttendanceData = (user_id: UserID): AttendanceRecord[] =>
    this.db
      .prepare("SELECT * FROM attendance WHERE attendee  = ?")
      .all(user_id);

  markUserForCurrentSession = (user_id: UserID): void => {
    const currentSession = this.getCurrentSession();

    if (!currentSession) throw new Error("No open sessions found");

    this.db
      .prepare(
        `INSERT INTO attendance 
          (attendee, session) 
          VALUES (?,?)`
      )
      .run(user_id, currentSession.session_id);
  };

  private _createNotifierTrigger = ({
    on,
    onTrigger,
    onTriggerArgs,
    tableName,
  }: {
    on: "update" | "insert" | "delete";
    onTrigger: (...params: any[]) => any;
    onTriggerArgs: any[];
    tableName: "sessions" | "attendance";
  }) => {
    this.db
      .transaction(() => {
        const funcName =
          onTrigger.name || "a" + Math.random().toString().replace(".", "");

        this.db.function(funcName, onTrigger);

        this.db
          .prepare(
            `
            CREATE TRIGGER IF NOT EXISTS on_${on}_trigger_${tableName}
              AFTER ${on} ON ${tableName}
            BEGIN
              SELECT ${funcName}(${onTriggerArgs.map(() => "?").join(",")});
            END
            `
          )
          .run(...onTriggerArgs);
      })
      .default();
  };

  createSessionsNotifierTriggers = (
    onTrigger: (...params: any[]) => any,
    ...onTriggerArgs: any[]
  ) => {
    this._createNotifierTrigger({
      on: "insert",
      onTrigger,
      onTriggerArgs,
      tableName: "sessions",
    });
    this._createNotifierTrigger({
      on: "update",
      onTrigger,
      onTriggerArgs,
      tableName: "sessions",
    });
    this._createNotifierTrigger({
      on: "delete",
      onTrigger,
      onTriggerArgs,
      tableName: "sessions",
    });
  };

  createAttendanceNotifierTriggers = (
    onTrigger: (...params: any[]) => any,
    ...onTriggerArgs: any[]
  ) => {
    this._createNotifierTrigger({
      on: "insert",
      onTrigger,
      onTriggerArgs,
      tableName: "attendance",
    });
    this._createNotifierTrigger({
      on: "update",
      onTrigger,
      onTriggerArgs,
      tableName: "attendance",
    });
    this._createNotifierTrigger({
      on: "delete",
      onTrigger,
      onTriggerArgs,
      tableName: "attendance",
    });
  };

  getAllSessions = () => this.db.prepare("SELECT * FROM sessions").all();
}
