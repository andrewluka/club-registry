import Database from "better-sqlite3";
import GamesService from "./GamesService";
import { Game } from "../../typings/game";

test("GamesService#addGame", () => {
  const db = Database(":memory:");
  const gamesService = new GamesService(db);

  const name = "rando";

  const game_id = gamesService.addGame({ name });
  const game: Game | undefined = db
    .prepare("SELECT * FROM games WHERE game_id = ?")
    .all(game_id)[0];

  expect(game?.name).toBe(name);
  expect(game?.is_suspended).toBe(0);
  expect(game?.user_with_the_game).toBe(null);
  expect(Number(game?.game_id)).toBeGreaterThanOrEqual(0);
});
