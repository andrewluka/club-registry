import { expect } from "chai";
import TablesService from "./TablesService";
import GamesService from "./GamesService";
import UsersService from "./UsersService";
import Database from "better-sqlite3";

test("TablesService#createTables creates users' and games' table", () => {
  const db = Database(":memory:");
  const tablesService = new TablesService(db);

  tablesService.createTables();

  const usersExist = db.prepare("PRAGMA table_info(users)").all().length > 0;
  const gamesExist = db.prepare("PRAGMA table_info(games)").all().length > 0;

  expect(usersExist).to.be.true;
  expect(gamesExist).to.be.true;

  const user_id = db.prepare("INSERT INTO users (name) VALUES ('98')").run()
    .lastInsertRowid;
  const user = db.prepare("SELECT * FROM users WHERE user_id = ?").all(user_id);

  console.log(user);

  console.log(
    db
      .prepare(
        `SELECT COUNT(*)
        FROM sessions
        WHERE session_end IS NULL`
      )
      .all()
  );

  (() => {
    let e: any;

    try {
      db.prepare("INSERT INTO users (phone_number) VALUES ('98')").run();
    } catch (e_) {
      e = e_;
    }

    expect(Boolean(e)).to.be.true;
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

    expect(Boolean(e)).to.be.true;
  })();

  (() => {
    let e: any;

    try {
      db.prepare("INSERT INTO game (name, is_suspended) VALUES ('i', 9)").run();
    } catch (e_) {
      e = e_;
    }

    expect(Boolean(e)).to.be.true;
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

  console.log(usersService.getUser(user_id1));

  gamesService.borrowGame({ borrower: user_id1, game: game_id1 });
  gamesService.borrowGame({ borrower: user_id2, game: game_id2 });

  const borrowersAndGames = tablesService.getBorrowersAndGames();

  const datesOfBorrowing = borrowersAndGames.map(
    ({ date_borrowed }) => date_borrowed
  );

  expect(datesOfBorrowing.length).to.equal(2);
  expect(datesOfBorrowing.map((e) => typeof e)).to.deep.equal([
    "number",
    "number",
  ]);

  expect(
    borrowersAndGames.map(({ date_borrowed: _, ...others }) => ({ ...others }))
  ).to.deep.equal([
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
