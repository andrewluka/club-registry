import Database from "better-sqlite3";
import GamesService from "./GamesService";
import { Game } from "../../typings/game";
import UsersService from "./UsersService";

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

  let e: any;

  const user_id = Number(
    db.prepare("INSERT INTO users (name) VALUES (?)").run("user name")
      .lastInsertRowid
  );

  const game_id = Number(
    db
      .prepare("INSERT INTO games (name, user_with_the_game) VALUES (?, ?)")
      .run("game name", user_id).lastInsertRowid
  );

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

  const user_id = Number(
    db.prepare("INSERT INTO users (name) VALUES (?)").run("user name")
      .lastInsertRowid
  );

  const game_id = Number(
    db
      .prepare("INSERT INTO games (name, user_with_the_game) VALUES (?, ?)")
      .run("game name", user_id).lastInsertRowid
  );

  expect(gamesService.isGameBorrowed(game_id)).toBe(true);

  const game_id2 = Number(
    db.prepare("INSERT INTO games (name) VALUES (?)").run("game name")
      .lastInsertRowid
  );

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

  db.prepare(
    `
    UPDATE games 
      SET user_with_the_game = @borrower 
      WHERE game_id = @game
    `
  ).run({
    borrower: user_id1,
    game: game_id,
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

  db.prepare(
    `
    UPDATE users 
      SET game_taken = @game 
      WHERE user_id = @borrower
    `
  ).run({
    borrower: user_id,
    game: game_id1,
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
