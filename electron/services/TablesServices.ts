import { Database } from "better-sqlite3";

export default class TablesServices {
  constructor(private db: Database) {}

  private _createUsersTable = () => {
    this.db
      .prepare(
        `
        CREATE TABLE IF NOT EXISTS users (
          user_id INTEGER NOT NULL PRIMARY KEY,
          name TEXT NOT NULL,
          date_of_birth INTEGER,
          phone_number VARCHAR(100),
          is_suspended INT NOT NULL DEFAULT 0,
          game_taken INTEGER,
          FOREIGN KEY (game_taken)
            REFERENCES games (game_id)  
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
          is_suspended INT NOT NULL DEFAULT 0,
          user_with_the_game INTEGER,
          FOREIGN KEY (user_with_the_game)
            REFERENCES users (user_id)  
        )
        `
      )
      .run();
  };

  createTables = () => {
    this._createUsersTable();
    this._createGamesTable();
  };
}
