import UsersService from "./UsersService";
import Database from "better-sqlite3";
import { User } from "../../typings/user";

test("UsersService#addUser adds user", () => {
  const db = Database(":memory:");
  const usersService = new UsersService(db);

  const name = "ME";
  const date_of_birth = null;
  const phone_number = "20193932";

  const user_id = usersService.addUser({ name, date_of_birth, phone_number });

  const user: User | undefined = db
    .prepare("SELECT * FROM users WHERE user_id = ?")
    .all(user_id)[0];

  expect(user?.name).toBe(name);
  expect(user?.date_of_birth).toBe(date_of_birth);
  expect(user?.phone_number).toBe(phone_number);
  expect(Number(user?.user_id)).toBeGreaterThanOrEqual(0);
});
