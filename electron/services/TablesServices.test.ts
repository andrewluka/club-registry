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
});
