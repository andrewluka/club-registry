import { Database } from "better-sqlite3";
import TablesServices from "./TablesServices";
import { User, UserID } from "../../typings/user";

interface AddUserOptions {
  name: string;
  date_of_birth?: number | null;
  phone_number?: string | null;
}

export default class UsersService {
  constructor(private db: Database) {
    const tablesService = new TablesServices(this.db);
    tablesService.createTables();
  }

  addUser({
    name,
    date_of_birth = null,
    phone_number = null,
  }: AddUserOptions): UserID {
    const insertStatement = this.db.prepare(
      `
      INSERT INTO users (name, date_of_birth, phone_number) 
        VALUES (@name, @date_of_birth, @phone_number)
      `
    );

    const user_id = insertStatement.run({
      name,
      date_of_birth,
      phone_number,
    }).lastInsertRowid;

    return Number(user_id);
  }
}
