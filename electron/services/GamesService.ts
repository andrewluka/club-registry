import { Database } from "better-sqlite3";
import TablesServices from "./TablesServices";
import { Game, GameID } from "../../typings/game";
import { UserID } from "../../typings/user";
import UsersService from "./UsersService";

interface AddGameOptions {
  name: string;
}

interface BorrowAndReturnGameOptions {
  borrower: UserID;
  game: GameID;
}

export default class GamesService {
  constructor(private db: Database) {
    const tablesService = new TablesServices(this.db);
    tablesService.createTables();
  }

  addGame = ({ name }: AddGameOptions): GameID => {
    const insertStatement = this.db.prepare(
      "INSERT INTO games (name) VALUES (?)"
    );

    const game_id = insertStatement.run(name).lastInsertRowid;

    return Number(game_id);
  };

  getGame = (game_id: GameID): Game | undefined => {
    const game = this.db
      .prepare("SELECT * FROM games WHERE game_id = ?")
      .all(game_id)[0];

    return game;
  };

  removeGame = (game_id: GameID): void => {
    if (this.isGameBorrowed(game_id)) {
      throw new Error(`Cannot delete game while it has been borrowed`);
    }

    this.db
      .prepare(`DELETE FROM games WHERE game_id = @game_id`)
      .run({ game_id });
  };

  isGameBorrowed = (game_id: GameID) => {
    const game = this.getGame(game_id);

    if (!game) {
      throw new Error(`No such game with game_id ${game_id}`);
    }

    const gameHasBeenBorrowed =
      game.user_with_the_game !== null && game.user_with_the_game !== undefined;

    return gameHasBeenBorrowed;
  };

  gameExists = (game_id: GameID): boolean => !!this.getGame(game_id);

  suspendGame = (game_id: GameID) => {
    if (this.isGameBorrowed(game_id)) {
      throw new Error(`Cannot suspend game while borrowed`);
    }

    this.db
      .prepare(
        `
        UPDATE games SET is_suspended = 1 
          WHERE game_id = ?
        `
      )
      .run(game_id);
  };

  unsuspendGame = (game_id: GameID) => {
    if (this.isGameBorrowed(game_id)) {
      throw new Error(`Cannot unsuspend game while borrowed`);
    }

    this.db
      .prepare(
        `
        UPDATE games SET is_suspended = 0 
          WHERE game_id = ?
        `
      )
      .run(game_id);
  };

  borrowGame = ({ borrower, game }: BorrowAndReturnGameOptions) => {
    const usersService = new UsersService(this.db);

    if (this.isGameBorrowed(game)) {
      throw new Error(`Game with game_id ${game} is already borrowed`);
    }

    if (usersService.hasUserBorrowedGame(borrower)) {
      throw new Error(
        `User with user_id ${borrower} has already borrowed a game`
      );
    }

    const updateUserStatement = this.db.prepare(
      `
      UPDATE users 
        SET game_taken = @game
        WHERE user_id = @borrower
      `
    );

    const updateGameStatement = this.db.prepare(
      `
      UPDATE games 
        SET user_with_the_game = @borrower
        WHERE game_id = @game
      `
    );

    this.db
      .transaction(() => {
        updateUserStatement.run({ borrower, game });
        updateGameStatement.run({ borrower, game });
      })
      .default();
  };

  returnGame = ({ game, borrower }: BorrowAndReturnGameOptions) => {
    const usersService = new UsersService(this.db);

    const { user_with_the_game } = this.getGame(game) || {};
    const { game_taken } = usersService.getUser(borrower) || {};

    if (user_with_the_game !== borrower || game !== game_taken) {
      throw new Error(`User with user_id ${borrower} has not \
borrowed game with game_id ${game}`);
    }

    const unlinkUserStatement = this.db.prepare(
      `
      UPDATE users
        SET game_taken = NULL
        WHERE user_id = ?
      `
    );

    const unlinkGameStatement = this.db.prepare(
      `
      UPDATE games
        SET user_with_the_game = NULL
        WHERE game_id = ?
      `
    );

    this.db
      .transaction(() => {
        unlinkUserStatement.run(borrower);
        unlinkGameStatement.run(game);
      })
      .default();
  };
}
