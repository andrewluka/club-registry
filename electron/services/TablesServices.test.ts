import TablesService from "./TablesServices";
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
