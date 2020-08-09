import { Database } from "better-sqlite3";
import { GameID } from "../../src/typings/game";
import { UserID } from "../../src/typings/user";

interface BorrowerAndGame {
  game_id: GameID;
  user_id: UserID;

  game_name: string;
  user_name: string;
}

export default class TablesService {
  constructor(private db: Database) {
    this.createTables();
  }

  private _createUsersTable = () => {
    this.db
      .prepare(
        `
        CREATE TABLE IF NOT EXISTS users (
          user_id INTEGER NOT NULL PRIMARY KEY,
          name TEXT NOT NULL,
          date_of_addition INTEGER NOT NULL,
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
          date_of_addition INTEGER NOT NULL,
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
          borrower_id INTEGER NOT NULL,
          game_id INTEGER NOT NULL,
          date_borrowed INTEGER NOT NULL,
          date_returned INTEGER,
          FOREIGN KEY (borrower_id)
            REFERENCES users (user_id),
          FOREIGN KEY (game_id)
            REFERENCES games (game_id)
        )
        `
      )
      .run();
  };

  createTables = () => {
    this._createUsersTable();
    this._createGamesTable();
    this._createBorrowingsTable();
  };

  getBorrowersAndGames = (): BorrowerAndGame[] => {
    return this.db
      .prepare(
        `
        SELECT 
          user_id,
          game_id,
          users.name as user_name,
          games.name as game_name
        FROM 
          users
        INNER JOIN games 
          ON users.borrowing = games.borrowing
        ORDER BY 
          user_id
        `
      )
      .all();
  };
}
