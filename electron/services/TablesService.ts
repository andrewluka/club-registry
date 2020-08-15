import { Database } from "better-sqlite3";
import { GameID } from "../../src/typings/game";
import { UserID } from "../../src/typings/user";

interface BorrowerAndGame {
  game_id: GameID;
  user_id: UserID;

  date_borrowed: number;

  game_name: string;
  user_name: string;
}

const currentUnixTimestampInMsGetterName = "getCurrentUnixTimestampInMs";

export default class TablesService {
  constructor(private db: Database) {
    this.createTables();
    this.db.function(currentUnixTimestampInMsGetterName, () => Date.now());
  }

  private _createUsersTable = () => {
    this.db
      .prepare(
        `
        CREATE TABLE IF NOT EXISTS users (
          user_id INTEGER NOT NULL PRIMARY KEY,
          name TEXT NOT NULL,
          date_of_addition INTEGER NOT NULL 
            DEFAULT (${this.getCurrentBorrowersAndGames}()),
          date_of_birth INTEGER,
          phone_number VARCHAR(100),
          is_suspended INT NOT NULL DEFAULT 0 
            CHECK(
              ((borrowing is not null) and (is_suspended = 0))
              or
              ((is_suspended = 0) or (is_suspended = 1))
            ),
          borrowing INTEGER,
          FOREIGN KEY (borrowing)
            REFERENCES borrowings (borrowing_id)
        )
        `
      )
      .run();
  };

  private _createGamesTable = () => {
    this.db
      .prepare(
        `
        CREATE TABLE IF NOT EXISTS games (
          game_id INTEGER NOT NULL PRIMARY KEY,
          name TEXT NOT NULL,
          date_of_addition INTEGER NOT NULL
            DEFAULT (${this.getCurrentBorrowersAndGames}()),
          tags TEXT,
          is_suspended INT NOT NULL DEFAULT 0
            CHECK(
              ((borrowing is not null) and (is_suspended = 0))
              or
              ((is_suspended = 0) or (is_suspended = 1))
            ),
            borrowing INTEGER,
          FOREIGN KEY (borrowing)
            REFERENCES borrowings (borrowing_id)  
        )
        `
      )
      .run();
  };

  private _createBorrowingsTable = () => {
    this.db
      .prepare(
        `
        CREATE TABLE IF NOT EXISTS borrowings (
          borrowing_id INTEGER PRIMARY KEY NOT NULL,
          date_borrowed INTEGER NOT NULL 
            DEFAULT (${this.getCurrentBorrowersAndGames}()),
          date_returned INTEGER,
          borrower_id INTEGER NOT NULL
            REFERENCES users (user_id) ON DELETE CASCADE,
          game_id INTEGER NOT NULL
            REFERENCES games (game_id) ON DELETE CASCADE
        )
        `
      )
      .run();
  };

  private _createSessionsTable = () => {
    this.db
      .prepare(
        `
      CREATE TABLE IF NOT EXISTS sessions (
        session_id INTEGER PRIMARY KEY NOT NULL,
        session_end INTEGER UNIQUE CHECK(
          CASE WHEN 
            session_end IS NULL 
          THEN 
            1 
          ELSE
            session_end > session_start
          END
        ),
        session_start INTEGER UNIQUE NOT NULL
          DEFAULT (${this.getCurrentBorrowersAndGames}())
      )
      `
      )
      .run();

    this.db
      .prepare(
        `
      CREATE TRIGGER IF NOT EXISTS multiple_unfinished_sessions_check
        BEFORE INSERT ON sessions
      BEGIN
        SELECT RAISE(FAIL, "multiple unfinished sessions")
          FROM sessions
        WHERE 
          (SELECT COUNT(*) FROM sessions WHERE session_end IS NULL) > 0;
      END
      `
      )
      .run();
  };

  private _createAttendanceTable = () => {
    this.db
      .prepare(
        `
        CREATE TABLE IF NOT EXISTS attendance (
          attendee INTEGER UNIQUE NOT NULL
            REFERENCES users (user_id) ON DELETE CASCADE,
          session INTEGER UNIQUE NOT NULL
            REFERENCES sessions (session_id) ON DELETE CASCADE,
          attendee_arrival_datetime INTEGER NOT NULL
            DEFAULT (${currentUnixTimestampInMsGetterName}())
        )
        `
      )
      .run();

    this.db
      .prepare(
        `
      CREATE TRIGGER IF NOT EXISTS multiple_unfinished_sessions_check
        BEFORE INSERT ON sessions
      BEGIN
        SELECT RAISE(FAIL, "multiple unfinished sessions")
          FROM sessions
        WHERE 
          (SELECT COUNT(*) FROM sessions WHERE session_end IS NULL) > 0;
      END
      `
      )
      .run();
  };

  createTables = () => {
    this._createUsersTable();
    this._createGamesTable();
    this._createBorrowingsTable();
    this._createSessionsTable();
    this._createAttendanceTable();
  };

  getCurrentBorrowersAndGames = (): BorrowerAndGame[] => {
    return this.db
      .prepare(
        `
        SELECT 
          borrower_id as user_id,
          borrowings.game_id as game_id,
          users.name as user_name,
          games.name as game_name,
          borrowings.date_borrowed as date_borrowed
        FROM 
          borrowings
        INNER JOIN users 
          ON users.borrowing = borrowing_id          
        INNER JOIN games 
          ON games.borrowing = borrowing_id
        WHERE
          date_returned IS NULL
        ORDER BY 
          user_id
        `
      )
      .all();
  };
}
