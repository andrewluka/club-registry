import { Database } from "better-sqlite3";
import {
  Game,
  GameID,
  AddGameOptions,
  UpdateGameNameOptions,
  BorrowAndReturnGameOptions,
  UpdateGameTagsOptions,
} from "../../src/typings/game";
import { GAMES_TAGS_DELIMITER } from "../../src/constants/tables";
import UsersService from "./UsersService";
import TablesService from "./TablesService";
import { BorrowingID } from "../../src/typings/statistics";
import AttendanceService from "./AttendanceService";

interface UpdateGameColumnOptions<T> {
  game_id: GameID;
  columnName: string;
  newValue: T;
}

export default class GamesService {
  constructor(private db: Database) {
    const tablesService = new TablesService(this.db);
    tablesService.createTables();
  }

  addGame = ({
    name,
    is_suspended = false,
    tags = null,
  }: AddGameOptions): GameID => {
    tags = [...new Set(tags)];

    const addGameStatement = this.db.prepare(
      `INSERT INTO games (name, is_suspended, tags, date_of_addition) 
        VALUES (@name, @is_suspended, @tags, @date_of_addition)`
    );

    const game_id = addGameStatement.run({
      name,
      is_suspended: Number(is_suspended) as any,
      tags: tags.join(GAMES_TAGS_DELIMITER) || null,
      date_of_addition: Date.now(),
    }).lastInsertRowid;

    return Number(game_id);
  };

  getGame = (game_id: GameID): Game | undefined =>
    this.db.prepare("SELECT * FROM games WHERE game_id = ?").all(game_id)[0];

  removeGame = (game_id: GameID): void => {
    if (this.isGameBorrowed(game_id)) {
      throw new Error(`Cannot delete game while it has been borrowed`);
    }

    const removeGameStatement = this.db.prepare(
      `DELETE FROM games WHERE game_id = ?`
    );

    removeGameStatement.run(game_id);
  };

  isGameBorrowed = (game_id: GameID) => {
    const game = this.getGame(game_id);

    if (!game) {
      throw new Error(`No such game with game_id ${game_id}`);
    }

    const gameHasBeenBorrowed =
      game.borrowing !== null && game.borrowing !== undefined;

    return gameHasBeenBorrowed;
  };

  gameExists = (game_id: GameID): boolean => !!this.getGame(game_id);

  suspendGame = (game_id: GameID) => {
    if (this.isGameBorrowed(game_id)) {
      throw new Error(`Cannot suspend game while borrowed`);
    }

    this._updateColumn({
      game_id,
      columnName: "is_suspended",
      newValue: 1,
    });
  };

  unsuspendGame = (game_id: GameID) => {
    if (this.isGameBorrowed(game_id)) {
      throw new Error(`Cannot unsuspend game while borrowed`);
    }

    this._updateColumn({
      game_id,
      columnName: "is_suspended",
      newValue: 0,
    });
  };

  borrowGame = ({
    borrower,
    game,
  }: BorrowAndReturnGameOptions): BorrowingID => {
    const usersService = new UsersService(this.db);
    const attendanceService = new AttendanceService(this.db);

    const currentSession = attendanceService.getCurrentSession();

    if (!currentSession) throw new Error("No session open");

    const isUserInCurrentSession = !!this.db
      .prepare("SELECT * FROM attendance WHERE attendee = ? AND session = ?")
      .all(borrower, currentSession.session_id)[0];

    if (!isUserInCurrentSession)
      throw new Error("User is not marked 'present' in the current session");

    if (this.isGameBorrowed(game)) {
      throw new Error(`Game with game_id ${game} is already borrowed`);
    }

    if (usersService.hasUserBorrowedGame(borrower)) {
      throw new Error(
        `User with user_id ${borrower} has already borrowed a game`
      );
    }

    const updateBorrowingsTableStatement = this.db.prepare(
      `
      INSERT INTO borrowings (
        borrower_id,
        game_id,
        date_borrowed,
        session_when_borrowed
      ) VALUES (
        @borrower,
        @game,
        @date_borrowed,
        @session_when_borrowed
      )
      `
    );

    const borrowGameTransaction = this.db.transaction(
      ({ borrower, game }: BorrowAndReturnGameOptions) => {
        const updateUserStatement = this.db.prepare(
          `
          UPDATE users 
            SET borrowing = @borrowing
            WHERE user_id = @borrower
          `
        );

        const updateGameStatement = this.db.prepare(
          `
          UPDATE games 
            SET borrowing = @borrowing
            WHERE game_id = @game
          `
        );

        const borrowing = updateBorrowingsTableStatement.run({
          borrower,
          game,
          date_borrowed: Date.now(),
          session_when_borrowed: attendanceService.getCurrentSession()
            ?.session_id,
        }).lastInsertRowid;

        updateUserStatement.run({ borrower, borrowing });
        updateGameStatement.run({ borrowing, game });

        return Number(borrowing);
      }
    );

    return borrowGameTransaction.default({ borrower, game });
  };

  returnGame = ({ game, borrower }: BorrowAndReturnGameOptions) => {
    const usersService = new UsersService(this.db);

    const { borrowing: gameBorrowing } = this.getGame(game) || {};
    const { borrowing: userBorrowing } = usersService.getUser(borrower) || {};

    if (gameBorrowing !== userBorrowing) {
      throw new Error(`User with user_id ${borrower} has not \
borrowed game with game_id ${game}`);
    }

    const unlinkUserStatement = this.db.prepare(
      `
      UPDATE users
        SET borrowing = NULL
        WHERE user_id = ?
      `
    );
    const unlinkGameStatement = this.db.prepare(
      `
      UPDATE games
        SET borrowing = NULL
        WHERE game_id = ?
      `
    );
    const unlinkBorrowingsTableStatement = this.db.prepare(
      `
      UPDATE borrowings
        SET date_returned = @date_returned
        WHERE borrowing_id = @borrowing
      `
    );

    const returnGameTransaction = this.db.transaction(
      ({ borrower, game }: BorrowAndReturnGameOptions) => {
        unlinkUserStatement.run(borrower);
        unlinkGameStatement.run(game);

        unlinkBorrowingsTableStatement.run({
          borrowing: userBorrowing,
          date_returned: Date.now(),
        });
      }
    );

    returnGameTransaction.deferred({ game, borrower });
  };

  getAllGames = (): Game[] => this.db.prepare("SELECT * FROM games").all();

  private _createNotifierTrigger = <
    TriggerFnParams extends any[],
    TriggerFnReturnType
  >({
    on,
    onTrigger,
    onTriggerArgs,
  }: {
    on: "update" | "insert" | "delete";
    onTrigger: (...params: TriggerFnParams) => TriggerFnReturnType;
    onTriggerArgs: TriggerFnParams;
  }) => {
    this.db
      .transaction(() => {
        const funcName =
          onTrigger.name || "a" + Math.random().toString().replace(".", "");

        this.db.function(funcName, onTrigger);

        this.db
          .prepare(
            `
            CREATE TRIGGER IF NOT EXISTS on_${on}_trigger_games
              AFTER ${on} ON games 
            BEGIN
              SELECT ${funcName}(${onTriggerArgs.map(() => "?").join(",")});
            END
            `
          )
          .run(...onTriggerArgs);
      })
      .default();
  };

  createNotifierTriggers = <TriggerFnParams extends any[], TriggerFnReturnType>(
    onTrigger: (...params: TriggerFnParams) => TriggerFnReturnType,
    ...onTriggerArgs: TriggerFnParams
  ) => {
    this._createNotifierTrigger({ on: "insert", onTrigger, onTriggerArgs });
    this._createNotifierTrigger({ on: "update", onTrigger, onTriggerArgs });
    this._createNotifierTrigger({ on: "delete", onTrigger, onTriggerArgs });
  };

  private _updateColumn = <T>({
    game_id,
    columnName,
    newValue,
  }: UpdateGameColumnOptions<T>) => {
    if (!this.gameExists(game_id)) {
      throw new Error(`No such game with game_id ${game_id}`);
    }

    this.db
      .prepare(
        `
        UPDATE games SET ${columnName} = @newValue 
        WHERE game_id = @game_id
        `
      )
      .run({ game_id, newValue });
  };

  updateGameName = ({ game_id, newName }: UpdateGameNameOptions) =>
    this._updateColumn({ game_id, newValue: newName, columnName: "name" });

  updateGameTags = ({ game_id, newTags }: UpdateGameTagsOptions) =>
    this._updateColumn({
      game_id,
      newValue: [...new Set(newTags)].join(GAMES_TAGS_DELIMITER),
      columnName: "tags",
    });

  getAllGameTags = (): string[] => {
    const getAllGameTagsStatement = this.db.prepare("SELECT tags FROM games");

    const tagsStrings: string[] = getAllGameTagsStatement
      .all()
      .map(({ tags }) => tags)
      .filter(Boolean);

    const splitTagsString = (e: string) => e.split(GAMES_TAGS_DELIMITER);
    const allTags = tagsStrings.flatMap(splitTagsString);

    return [...new Set(allTags)];
  };
}
