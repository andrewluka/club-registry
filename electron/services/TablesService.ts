import { Database } from "better-sqlite3";
import { GameID } from "../../typings/game";
import { UserID } from "../../typings/user";

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
          date_of_birth INTEGER,
          phone_number VARCHAR(100),
          is_suspended INT NOT NULL DEFAULT 0 
            CHECK(
              ((game_taken is not null) and (is_suspended = 0))
              or
              ((is_suspended = 0) or (is_suspended = 1))
            ),
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
          is_suspended INT NOT NULL DEFAULT 0
            CHECK(
              ((user_with_the_game is not null) and (is_suspended = 0))
              or
              ((is_suspended = 0) or (is_suspended = 1))
            ),
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
          ON users.game_taken = games.game_id
        ORDER BY 
          user_id
        `
      )
      .all();
  };
}
