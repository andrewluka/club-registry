import Database from "better-sqlite3";
import GamesService from "./GamesService";
import { Game } from "../../src/typings/game";
import UsersService from "./UsersService";
import { GAMES_TAGS_DELIMITER } from "../../src/constants/tables";

test("GamesService#addGame", () => {
  const db = Database(":memory:");
  const gamesService = new GamesService(db);

  const name = "rando";
  const tag = "hello";

  const game_id = gamesService.addGame({ name, tags: [tag, tag] });
  const game: Game | undefined = db
    .prepare("SELECT * FROM games WHERE game_id = ?")
    .all(game_id)[0];

  const tags = game?.tags?.split(GAMES_TAGS_DELIMITER);

  expect(game?.name).toBe(name);
  expect(game?.is_suspended).toBe(0);
  expect(game?.borrowing).toBe(null);
  expect(tags?.[0]).toBe(tag);
  expect(tags?.length).toBe(1);
  expect(game_id).toBeGreaterThanOrEqual(0);
  expect(Number(game?.game_id)).toBe(game_id);
});

test("GamesService#getGame", () => {
  const db = Database(":memory:");
  const gamesService = new GamesService(db);

  const name = "rando";

  const game_id = gamesService.addGame({ name });
  const game = gamesService.getGame(game_id);

  expect(game?.name).toBe(name);
});

test("GamesService#removeGame removes game", () => {
  const db = Database(":memory:");
  const gamesService = new GamesService(db);

  const game_id = db.prepare("INSERT INTO games (name) VALUES (?)").run("rando")
    .lastInsertRowid;

  gamesService.removeGame(Number(game_id));

  const gameExists = !!db
    .prepare("SELECT * FROM games WHERE game_id = ?")
    .all(game_id)[0];

  expect(gameExists).toBe(false);
});

test("GamesService#removeGame throws when game does not exist", () => {
  const db = Database(":memory:");
  const gamesService = new GamesService(db);

  let e: any;

  try {
    gamesService.removeGame(9);
  } catch (e_) {
    e = e_;
  }

  expect(e).toBeTruthy();
});

test("GamesService#removeGame throws when game has been borrowed", () => {
  const db = Database(":memory:");
  const gamesService = new GamesService(db);
  const usersService = new UsersService(db);

  let e: any;

  const game_id = gamesService.addGame({ name: "name" });
  const user_id = usersService.addUser({ name: "random name" });

  gamesService.borrowGame({ borrower: user_id, game: game_id });

  try {
    gamesService.removeGame(game_id);
  } catch (e_) {
    e = e_;
  }

  expect(e).toBeTruthy();
});

test("GamesService#isGameBorrowed returns correct boolean value", () => {
  const db = Database(":memory:");
  const gamesService = new GamesService(db);
  const usersService = new UsersService(db);

  const game_id = gamesService.addGame({ name: "name" });
  const user_id = usersService.addUser({ name: "random name" });

  gamesService.borrowGame({ borrower: user_id, game: game_id });

  expect(gamesService.isGameBorrowed(game_id)).toBe(true);

  const game_id2 = gamesService.addGame({ name: "name" });

  expect(gamesService.isGameBorrowed(game_id2)).toBe(false);
});

test("GamesService#isGameBorrowed throws when game does not exist", () => {
  const db = Database(":memory:");
  const gamesService = new GamesService(db);

  let e: any;

  try {
    gamesService.isGameBorrowed(67);
  } catch (e_) {
    e = e_;
  }

  expect(e).toBeTruthy();
});

test("GamesService#gameExists", () => {
  const db = Database(":memory:");
  const gamesService = new GamesService(db);

  const game_id = Number(
    db.prepare("INSERT INTO games (name) VALUES ('game name')").run()
      .lastInsertRowid
  );

  expect(gamesService.gameExists(game_id)).toBe(true);
  expect(gamesService.gameExists(645)).toBe(false);
});

test("GamesService#suspendGame suspends game", () => {
  const db = Database(":memory:");
  const gamesService = new GamesService(db);

  const game_id = Number(
    db
      .prepare("INSERT INTO games (name, is_suspended) VALUES (?,?)")
      .run("game name", 0).lastInsertRowid
  );

  gamesService.suspendGame(game_id);

  const game: Game | undefined = db
    .prepare(`SELECT * FROM games WHERE game_id = ?`)
    .all(game_id)[0];

  expect(game?.is_suspended).toBe(1);
});

test("GamesService#suspendGame throws when game does not exist", () => {
  const db = Database(":memory:");
  const gamesService = new GamesService(db);

  let e: any;

  try {
    gamesService.suspendGame(7);
  } catch (e_) {
    e = e_;
  }

  expect(e).toBeTruthy();
});

test("GamesService#unsuspendGame unsuspends game", () => {
  const db = Database(":memory:");
  const gamesService = new GamesService(db);

  let e: any;

  try {
    gamesService.unsuspendGame(7);
  } catch (e_) {
    e = e_;
  }

  expect(e).toBeTruthy();

  const game_id = Number(
    db
      .prepare("INSERT INTO games (name, is_suspended) VALUES (?,?)")
      .run("game name", 1).lastInsertRowid
  );

  gamesService.unsuspendGame(game_id);

  const { is_suspended } = db
    .prepare(`SELECT is_suspended FROM games WHERE game_id = ?`)
    .all(game_id)[0];

  expect(is_suspended).toBe(0);
});

test("GamesService#unsuspendGame throws when game does not exist", () => {
  const db = Database(":memory:");
  const gamesService = new GamesService(db);

  let e: any;

  try {
    gamesService.unsuspendGame(7);
  } catch (e_) {
    e = e_;
  }

  expect(e).toBeTruthy();
});

test("GamesService#borrowGame throws when user does not exist", () => {
  const db = Database(":memory:");
  const gamesService = new GamesService(db);

  const game_id = gamesService.addGame({ name: "name" });

  let e: any;

  try {
    gamesService.borrowGame({ borrower: 654, game: game_id });
  } catch (e_) {
    e = e_;
  }

  expect(e).toBeTruthy();
});

test("GamesService#borrowGame throws when game does not exist", () => {
  const db = Database(":memory:");
  const gamesService = new GamesService(db);
  const usersService = new UsersService(db);

  const user_id = usersService.addUser({ name: "name" });

  let e: any;

  try {
    gamesService.borrowGame({ borrower: user_id, game: 87 });
  } catch (e_) {
    e = e_;
  }

  expect(e).toBeTruthy();
});

test("GamesService#borrowGame throws when game has already \
been borrowed", () => {
  const db = Database(":memory:");
  const gamesService = new GamesService(db);
  const usersService = new UsersService(db);

  const user_id1 = usersService.addUser({ name: "name" });
  const user_id2 = usersService.addUser({ name: "name" });
  const game_id = gamesService.addGame({ name: "name" });

  const borrowing = db
    .prepare(
      `
    INSERT INTO borrowings (
      borrower_id, 
      game_id,
      date_borrowed
    ) VALUES (?, ?, ?)
    `
    )
    .run(user_id1, game_id, Date.now()).lastInsertRowid;

  db.prepare(
    `
    UPDATE users 
      SET borrowing = @borrowing 
      WHERE user_id = @borrower
    `
  ).run({
    borrower: user_id1,
    borrowing,
  });

  db.prepare(
    `
    UPDATE games 
      SET borrowing = @borrowing 
      WHERE game_id = @game
    `
  ).run({
    game: game_id,
    borrowing,
  });

  let e: any;

  try {
    gamesService.borrowGame({ borrower: user_id2, game: game_id });
  } catch (e_) {
    e = e_;
  }

  expect(e).toBeTruthy();
});

test("GamesService#borrowGame throws when user has already \
borrowed a game", () => {
  const db = Database(":memory:");
  const gamesService = new GamesService(db);
  const usersService = new UsersService(db);

  const user_id = usersService.addUser({ name: "name" });
  const game_id1 = gamesService.addGame({ name: "name" });
  const game_id2 = gamesService.addGame({ name: "name" });

  const borrowing = db
    .prepare(
      `
    INSERT INTO borrowings (
      borrower_id, 
      game_id,
      date_borrowed
    ) VALUES (?, ?, ?)
    `
    )
    .run(user_id, game_id1, Date.now()).lastInsertRowid;

  db.prepare(
    `
    UPDATE users 
      SET borrowing = @borrowing 
      WHERE user_id = @borrower
    `
  ).run({
    borrower: user_id,
    borrowing,
  });

  db.prepare(
    `
    UPDATE games 
      SET borrowing = @borrowing 
      WHERE game_id = @game
    `
  ).run({
    game: game_id1,
    borrowing,
  });

  let e: any;

  try {
    gamesService.borrowGame({ borrower: user_id, game: game_id2 });
  } catch (e_) {
    e = e_;
  }

  expect(e).toBeTruthy();
});

test("GamesService#returnGame 'unlinks' user and game", () => {
  const db = Database(":memory:");
  const gamesService = new GamesService(db);
  const usersService = new UsersService(db);

  const user_id = usersService.addUser({ name: "name" });
  const game_id = gamesService.addGame({ name: "name" });

  gamesService.borrowGame({ borrower: user_id, game: game_id });
  gamesService.returnGame({ borrower: user_id, game: game_id });

  expect(gamesService.isGameBorrowed(game_id)).toBe(false);
  expect(usersService.hasUserBorrowedGame(user_id)).toBe(false);
});

test("GamesService#returnGame accepts only \
matching game and user and throws otherwise", () => {
  const db = Database(":memory:");
  const gamesService = new GamesService(db);
  const usersService = new UsersService(db);

  const user_id1 = usersService.addUser({ name: "name" });
  const user_id2 = usersService.addUser({ name: "name" });
  const game_id = gamesService.addGame({ name: "name" });

  gamesService.borrowGame({ borrower: user_id1, game: game_id });

  let e: any;

  try {
    gamesService.returnGame({ borrower: user_id2, game: game_id });
  } catch (e_) {
    e = e_;
  }

  expect(e).toBeTruthy();
});

test("GamesService#getAllGames", () => {
  const db = Database(":memory:");
  const gamesService = new GamesService(db);

  const name = "a game";

  gamesService.addGame({ name });

  const games = gamesService.getAllGames();

  expect(games.length).toBe(1);
  expect(games[0].name).toBe(name);
});

test("GamesService#createNotifierTriggers", () => {
  const db = Database(":memory:");
  const gamesService = new GamesService(db);

  let x = 0;

  const inc = () => (x += 1);

  gamesService.createNotifierTriggers(inc);

  const game_id = gamesService.addGame({ name: "name" });
  expect(x).toBe(1);

  db.prepare("UPDATE games SET name = ?").run("lol");
  expect(x).toBe(2);

  gamesService.removeGame(game_id);
  expect(x).toBe(3);
});

test("GamesService#updateGameName", () => {
  const db = Database(":memory:");
  const gamesService = new GamesService(db);

  const game_id = gamesService.addGame({ name: "random name here" });
  const newName = "new name";

  gamesService.updateGameName({ game_id, newName });

  expect(gamesService.getGame(game_id)?.name).toBe(newName);
});

test("GamesService#updateGameName throws when game doesn't exist", () => {
  const db = Database(":memory:");
  const gamesService = new GamesService(db);

  let e: any;

  try {
    gamesService.updateGameName({ game_id: 7, newName: "not there :(" });
  } catch (e_) {
    e = e_;
  }

  expect(e).toBeTruthy();
});

test("GamesService#updateGameTags completely overrides old tags \
and removes duplicates from new ones", () => {
  const db = Database(":memory:");
  const gamesService = new GamesService(db);

  const game_id = gamesService.addGame({ name: "random name here" });

  const tag = "hello";
  const tags = [tag, tag, "meIsTag"];

  gamesService.updateGameTags({ game_id, newTags: tags });

  const game = gamesService.getGame(game_id);

  const expectedTags = [...new Set(tags)];
  const actualTags = game?.tags?.split(GAMES_TAGS_DELIMITER);

  expect(actualTags?.length).toBe(2);
  expect(actualTags).toEqual(expectedTags);
});

test("GamesService#updateGameTags throws when game \
does not exist", () => {
  const db = Database(":memory:");
  const gamesService = new GamesService(db);

  let e: any;

  try {
    gamesService.updateGameTags({ game_id: 87, newTags: [":("] });
  } catch (e_) {
    e = e_;
  }

  expect(e).toBeTruthy();
});

test("GamesService#getAllGameTags", () => {
  const db = Database(":memory:");
  const gamesService = new GamesService(db);

  const tags1 = ["a", "b", "c"];
  const tags2 = ["b", "d", "t", "v", "b"];

  const allTags = [...new Set([...tags1, ...tags2])].sort();

  gamesService.addGame({ name: "random name1", tags: tags1 });
  gamesService.addGame({ name: "random name2", tags: tags2 });

  expect(gamesService.getAllGameTags().sort()).toStrictEqual(allTags);
});
