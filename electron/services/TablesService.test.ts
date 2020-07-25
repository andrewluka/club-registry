import TablesService from "./TablesService";
import GamesService from "./GamesService";
import UsersService from "./UsersService";
import Database from "better-sqlite3";

test("TablesService#createTables creates tables", () => {
  const db = Database(":memory:");
  const tablesService = new TablesService(db);

  tablesService.createTables();

  const usersExist = db.prepare("PRAGMA table_info(users)").all().length > 0;
  const gamesExist = db.prepare("PRAGMA table_info(games)").all().length > 0;

  expect(usersExist).toBe(true);
  expect(gamesExist).toBe(true);

  (() => {
    let e: any;

    try {
      db.prepare("INSERT INTO users (phone_number) VALUES ('98')").run();
    } catch (e_) {
      e = e_;
    }

    expect(e).toBeTruthy();
  })();

  (() => {
    let e: any;

    try {
      db.prepare(
        "INSERT INTO users (name, is_suspended) VALUES ('i', 9)"
      ).run();
    } catch (e_) {
      e = e_;
    }

    expect(e).toBeTruthy();
  })();

  (() => {
    let e: any;

    try {
      db.prepare("INSERT INTO game (name, is_suspended) VALUES ('i', 9)").run();
    } catch (e_) {
      e = e_;
    }

    expect(e).toBeTruthy();
  })();
});

test("TablesService#getBorrowersAndGames", () => {
  const db = Database(":memory:");
  const tablesService = new TablesService(db);
  const gamesService = new GamesService(db);
  const usersService = new UsersService(db);

  tablesService.createTables();

  const game_id1 = gamesService.addGame({ name: "game1 name" });
  const game_id2 = gamesService.addGame({ name: "game2 name" });

  const user_id1 = usersService.addUser({ name: "user1 name" });
  const user_id2 = usersService.addUser({ name: "user2 name" });

  gamesService.borrowGame({ borrower: user_id1, game: game_id1 });
  gamesService.borrowGame({ borrower: user_id2, game: game_id2 });

  expect(tablesService.getBorrowersAndGames()).toEqual([
    {
      user_id: user_id1,
      game_id: game_id1,
      game_name: "game1 name",
      user_name: "user1 name",
    },
    {
      user_id: user_id2,
      game_id: game_id2,
      game_name: "game2 name",
      user_name: "user2 name",
    },
  ]);
});
