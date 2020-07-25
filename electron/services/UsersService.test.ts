import UsersService from "./UsersService";
import Database from "better-sqlite3";
import { User } from "../../typings/user";
import GamesService from "./GamesService";

test("UsersService#addUser adds user", () => {
  const db = Database(":memory:");
  const usersService = new UsersService(db);

  const name = "ME";
  const date_of_birth = null;
  const phone_number = "20193932";

  const user_id = usersService.addUser({ name, date_of_birth, phone_number });

  const user = usersService.getUser(user_id);

  expect(user?.name).toBe(name);
  expect(user?.date_of_birth).toBe(date_of_birth);
  expect(user?.phone_number).toBe(phone_number);
  expect(user_id).toBeGreaterThanOrEqual(0);
  expect(Number(user?.user_id)).toBe(user_id);
});

test("UsersService#getUser adds user", () => {
  const db = Database(":memory:");
  const usersService = new UsersService(db);

  const name = "ME";
  const date_of_birth = null;
  const phone_number = "20193932";

  const user_id = usersService.addUser({ name, date_of_birth, phone_number });

  const user = usersService.getUser(user_id);

  expect(user?.name).toBe(name);
  expect(user?.date_of_birth).toBe(date_of_birth);
  expect(user?.phone_number).toBe(phone_number);
});

test("UsersService#removeUser removes user", () => {
  const db = Database(":memory:");
  const usersService = new UsersService(db);
  const gamesService = new GamesService(db);

  let e: any;

  const game_id = gamesService.addGame({ name: "game name" });
  const user_id = usersService.addUser({ name: "user name" });

  gamesService.borrowGame({ borrower: user_id, game: game_id });

  try {
    usersService.removeUser(Number(user_id));
  } catch (e_) {
    e = e_;
  }

  expect(e).toBeTruthy();
});

test("UsersService#removeUser throws when user does not exist", () => {
  const db = Database(":memory:");
  const usersService = new UsersService(db);

  let e: any;

  try {
    usersService.removeUser(8);
  } catch (e_) {
    e = e_;
  }

  expect(e).toBeTruthy();
});

test("UsersService#hasUserBorrowedGame", () => {
  const db = Database(":memory:");
  const usersService = new UsersService(db);
  const gamesService = new GamesService(db);

  let e: any;

  try {
    usersService.hasUserBorrowedGame(98);
  } catch (e_) {
    e = e_;
  }

  expect(e).toBeTruthy();

  const game_id = gamesService.addGame({ name: "game name" });
  const user_id = usersService.addUser({ name: "user name" });

  gamesService.borrowGame({ borrower: user_id, game: game_id });

  expect(usersService.hasUserBorrowedGame(user_id)).toBe(true);
});

test("UsersService#userExists returns correct boolean value", () => {
  const db = Database(":memory:");
  const usersService = new UsersService(db);

  const user_id = usersService.addUser({ name: "name" });

  expect(usersService.userExists(user_id)).toBe(true);
  expect(usersService.userExists(645)).toBe(false);
});

test("UsersService#suspendUser suspends user", () => {
  const db = Database(":memory:");
  const usersService = new UsersService(db);

  const user_id = usersService.addUser({ name: "user" });

  usersService.suspendUser(user_id);

  const { is_suspended } = usersService.getUser(user_id) || {};
  expect(is_suspended).toBe(1);
});

test("UsersService#suspendUser throws when user does not exist", () => {
  const db = Database(":memory:");
  const usersService = new UsersService(db);

  let e: any;

  try {
    usersService.suspendUser(87);
  } catch (e_) {
    e = e_;
  }

  expect(e).toBeTruthy();
});

test("UsersService#suspendUser throws when user has borrowed a game", () => {
  const db = Database(":memory:");
  const usersService = new UsersService(db);
  const gamesService = new GamesService(db);

  const game_id = gamesService.addGame({ name: "game" });
  const user_id = usersService.addUser({ name: "user" });

  gamesService.borrowGame({ borrower: user_id, game: game_id });

  let e: any;

  try {
    usersService.suspendUser(user_id);
  } catch (e_) {
    e = e_;
  }

  expect(e).toBeTruthy();
});

test("UsersService#unsuspendUser unsuspends user", () => {
  const db = Database(":memory:");
  const usersService = new UsersService(db);

  const user_id = Number(
    db
      .prepare("INSERT INTO users (name, is_suspended) VALUES (?,?)")
      .run("game name", 1).lastInsertRowid
  );

  usersService.unsuspendUser(user_id);

  const { is_suspended } = usersService.getUser(user_id) || {};
  expect(is_suspended).toBe(0);
});

test("UsersService#unsuspendUser throws when user does not exist", () => {
  const db = Database(":memory:");
  const usersService = new UsersService(db);

  let e: any;

  try {
    usersService.unsuspendUser(87);
  } catch (e_) {
    e = e_;
  }

  expect(e).toBeTruthy();
});

test("UsersService#getAllUsers", () => {
  const db = Database(":memory:");
  const usersService = new UsersService(db);

  const name = "me";

  usersService.addUser({ name });

  const users = usersService.getAllUsers();

  expect(users.length).toBe(1);
  expect(users[0].name).toBe(name);
});
