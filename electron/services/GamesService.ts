import { Database } from "better-sqlite3";
import TablesServices from "./TablesServices";
import { Game, GameID } from "../../typings/game";

interface AddGameOptions {
  name: string;
}

export default class GamesService {
  constructor(private db: Database) {
    const tablesService = new TablesServices(this.db);
    tablesService.createTables();
  }

  addGame = ({ name }: AddGameOptions): GameID => {
    const insertStatement = this.db.prepare(
      "INSERT INTO games (name) VALUES (?)"
    );

    const game_id = insertStatement.run(name).lastInsertRowid;

    return Number(game_id);
  };

  getGame = (game_id: GameID): Game | undefined => {
    const game = this.db
      .prepare("SELECT * FROM games WHERE game_id = ?")
      .all(game_id)[0];

    return game;
  };
}
