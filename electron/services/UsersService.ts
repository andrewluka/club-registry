import { Database } from "better-sqlite3";
import {
  User,
  UserID,
  AddUserOptions,
  UpdateUserNameOptions,
} from "../../src/typings/user";
import TablesService from "./TablesService";

interface UpdateUserColumnOptions<T> {
  user_id: UserID;
  columnName: string;
  newValue: T;
}

export default class UsersService {
  constructor(private db: Database) {
    const tablesService = new TablesService(this.db);
    tablesService.createTables();
  }

  addUser = ({
    name,
    date_of_birth = null,
    phone_number = null,
  }: AddUserOptions): UserID => {
    const addUserStatement = this.db.prepare(
      `
      INSERT INTO users (name, date_of_birth, phone_number, date_of_addition) 
        VALUES (@name, @date_of_birth, @phone_number, @date_of_addition)
      `
    );

    const user_id = addUserStatement.run({
      name,
      date_of_birth,
      phone_number,
      date_of_addition: Date.now(),
    }).lastInsertRowid;

    return Number(user_id);
  };

  removeUser = (user_id: UserID): void => {
    if (this.hasUserBorrowedGame(user_id)) {
      throw new Error(`Cannot remove user while user \
has a game`);
    }

    const removeUserStatement = this.db.prepare(
      "DELETE FROM users WHERE user_id = ?"
    );

    removeUserStatement.run(user_id);
  };

  getUser = (user_id: UserID): User | undefined => {
    const getUserStatement = this.db.prepare(
      "SELECT * FROM users WHERE user_id = ?"
    );

    const user = getUserStatement.all(user_id)[0];

    return user;
  };

  hasUserBorrowedGame = (user_id: UserID) => {
    const user = this.getUser(user_id);

    if (!user) {
      throw new Error(`No such user with user_id ${user_id}`);
    }

    const userHasGame = user.borrowing !== undefined && user.borrowing !== null;

    return userHasGame;
  };

  suspendUser = (user_id: UserID) => {
    if (this.hasUserBorrowedGame(user_id)) {
      throw new Error(`Cannot suspend user while user has borrowed game`);
    }

    this._updateColumn({
      user_id,
      columnName: "is_suspended",
      newValue: 1,
    });
  };

  unsuspendUser = (user_id: UserID) => {
    if (this.hasUserBorrowedGame(user_id)) {
      throw new Error(`Cannot unsuspend user while user has borrowed game`);
    }

    this._updateColumn({
      user_id,
      columnName: "is_suspended",
      newValue: 0,
    });
  };

  userExists = (user_id: UserID): boolean => !!this.getUser(user_id);

  getAllUsers = (): User[] => this.db.prepare("SELECT * FROM users").all();

  private _updateColumn = <T>({
    user_id,
    columnName,
    newValue,
  }: UpdateUserColumnOptions<T>) => {
    if (!this.userExists(user_id)) {
      throw new Error(`No such user with user_id ${user_id}`);
    }

    this.db
      .prepare(
        `
        UPDATE users SET ${columnName} = @newValue 
        WHERE user_id = @user_id
        `
      )
      .run({ user_id, newValue });
  };

  private _createNotifierTrigger = ({
    on,
    onTrigger,
    onTriggerArgs,
  }: {
    on: "update" | "insert" | "delete";
    onTrigger: (...params: any[]) => any;
    onTriggerArgs: any[];
  }) => {
    this.db
      .transaction(() => {
        const funcName =
          onTrigger.name || "a" + Math.random().toString().replace(".", "");

        this.db.function(funcName, onTrigger);

        this.db
          .prepare(
            `
            CREATE TRIGGER IF NOT EXISTS on_${on}_trigger_users
              AFTER ${on} ON users 
            BEGIN
              SELECT ${funcName}(${onTriggerArgs.map(() => "?").join(",")});
            END
            `
          )
          .run(...onTriggerArgs);
      })
      .default();
  };

  createNotifierTriggers = (
    onTrigger: (...params: any[]) => any,
    ...onTriggerArgs: any[]
  ) => {
    this._createNotifierTrigger({ on: "insert", onTrigger, onTriggerArgs });
    this._createNotifierTrigger({ on: "update", onTrigger, onTriggerArgs });
    this._createNotifierTrigger({ on: "delete", onTrigger, onTriggerArgs });
  };

  updateUserName = ({ user_id, newName }: UpdateUserNameOptions) => {
    if (!this.userExists(user_id)) {
      throw new Error(`No such user with user_id ${user_id}`);
    }

    this._updateColumn({
      user_id,
      columnName: "name",
      newValue: newName,
    });
  };
}
