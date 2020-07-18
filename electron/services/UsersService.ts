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

  addUser = ({
    name,
    date_of_birth = null,
    phone_number = null,
  }: AddUserOptions): UserID => {
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
  };

  removeUser = (user_id: UserID): void => {
    if (this.hasUserBorrowedGame(user_id)) {
      throw new Error(`Cannot remove user while user \
has a game`);
    }

    this.db
      .prepare("DELETE FROM users WHERE user_id = @the_user_id")
      .run({ the_user_id: user_id });
  };

  getUser = (user_id: UserID): User | undefined => {
    const user = this.db
      .prepare("SELECT * FROM users WHERE user_id = ?")
      .all(user_id)[0];

    return user;
  };

  hasUserBorrowedGame = (user_id: UserID) => {
    const user = this.getUser(user_id);

    if (!user) {
      throw new Error(`No such user with user_id ${user_id}`);
    }

    const userHasGame =
      user.game_taken !== undefined && user.game_taken !== null;

    return userHasGame;
  };

  suspendUser = (user_id: UserID) => {
    if (this.hasUserBorrowedGame(user_id)) {
      throw new Error(`Cannot suspend user while user has borrowed game`);
    }

    this.db
      .prepare(
        `
        UPDATE users SET is_suspended = 1 
          WHERE user_id = ?
        `
      )
      .run(user_id);
  };

  unsuspendUser = (user_id: UserID) => {
    if (this.hasUserBorrowedGame(user_id)) {
      throw new Error(`Cannot unsuspend user while user has borrowed game`);
    }

    this.db
      .prepare(
        `
        UPDATE users SET is_suspended = 0
          WHERE user_id = ?
        `
      )
      .run(user_id);
  };

  userExists = (user_id: UserID): boolean => !!this.getUser(user_id);
}
