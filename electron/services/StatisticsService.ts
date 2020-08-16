import { Database } from "better-sqlite3";
import TablesService from "./TablesService";
import {
  BorrowingID,
  BorrowingAndGameData,
  StatisticsFilter,
  GameStatistics,
  UserStatistics,
  CountingRecord,
} from "../../src/typings/statistics";
import { UserID } from "../../src/typings/user";
import { GameID } from "../../src/typings/game";
import { GAMES_TAGS_DELIMITER } from "../../src/constants/tables";
import GamesService from "./GamesService";
import UsersService from "./UsersService";

const getFrequencyCounter = <T>(extractor: (x: T) => string) => {
  return (a: { [thing: string]: number }, b: T) => {
    const thing = extractor(b);
    const newRecord = { ...a };

    newRecord[thing] ? newRecord[thing]++ : (newRecord[thing] = 1);
    return newRecord;
  };
};

export default class StatisticsService {
  constructor(private db: Database) {
    const tablesService = new TablesService(this.db);
    tablesService.createTables();
  }

  getBorrowing = (
    borrowing_id: BorrowingID
  ): BorrowingAndGameData | undefined =>
    this._getFilteredBorrowings("borrowing_id = ?", borrowing_id)[0];

  getUserBorrowings = (user_id: UserID) =>
    this._getFilteredBorrowings("borrower_id = ?", user_id);

  getGameBorrowings = (game_id: GameID) =>
    this._getFilteredBorrowings("game_id = ?", game_id);

  private _getFilteredBorrowings = (
    whereClauseConditions?: string,
    ...bindParams: any[]
  ): BorrowingAndGameData[] =>
    this.db
      .prepare(
        `
        SELECT 
          borrowings.borrower_id,
          borrowings.borrowing_id,
          borrowings.game_id,
          borrowings.date_borrowed,
          borrowings.date_returned,
          games.name,
          games.tags
        FROM borrowings
        INNER JOIN games
          ON borrowings.game_id = games.game_id
        ${whereClauseConditions ? `WHERE ${whereClauseConditions}` : ""}
        `
      )
      .all(...bindParams);

  getAllBorrowings = () => this._getFilteredBorrowings();

  private _countTags = (
    borrowings: BorrowingAndGameData[]
  ): CountingRecord<string> => {
    const splitBorrowingTags = ({ tags }: BorrowingAndGameData) =>
      tags?.split(GAMES_TAGS_DELIMITER) || [];

    const allTags = borrowings.flatMap(splitBorrowingTags);
    const countFrequency = getFrequencyCounter((x: string) => x);

    return allTags.reduce(countFrequency, {});
  };

  getUserStatistics = (
    user_id: UserID,
    filterForWholeStatistics?: StatisticsFilter
  ): UserStatistics => {
    const usersService = new UsersService(this.db);

    if (!usersService.userExists(user_id))
      throw new Error(`No such user with user_id ${user_id}`);

    const allBorrowings = filterForWholeStatistics
      ? this._getFilteredBorrowings(
          `borrower_id = ? AND ${filterForWholeStatistics.sqliteExpression}`,
          user_id,
          ...[filterForWholeStatistics.bindParams]
        )
      : this._getFilteredBorrowings("borrower_id = ?", user_id);

    const extractGameId = ({ game_id }: BorrowingAndGameData) =>
      String(game_id);
    const borrowingsReducer = getFrequencyCounter(extractGameId);
    const gamesBorrowingsCount = allBorrowings.reduce(borrowingsReducer, {});

    const tagsBorrowedCount = this._countTags(allBorrowings);

    return {
      allBorrowings,
      gamesBorrowingsCount,
      tagsBorrowedCount,
    };
  };

  getGameStatistics = (
    game_id: GameID,
    filterForWholeStatistics?: StatisticsFilter
  ): GameStatistics => {
    const gamesService = new GamesService(this.db);

    if (!gamesService.gameExists(game_id))
      throw new Error(`No such game with game_id ${game_id}`);

    const allBorrowings = filterForWholeStatistics
      ? this._getFilteredBorrowings(
          `games.game_id = ? AND ${filterForWholeStatistics.sqliteExpression}`,
          game_id,
          ...[filterForWholeStatistics.bindParams]
        )
      : this._getFilteredBorrowings("games.game_id = ?", game_id);

    const extractBorrower = ({ borrower_id }: BorrowingAndGameData) =>
      String(borrower_id);
    const borrowingsReducer = getFrequencyCounter(extractBorrower);
    const borrowersCount = allBorrowings.reduce(borrowingsReducer, {});

    return {
      allBorrowings,
      borrowersCount,
    };
  };

  getTagsCount = (filterForWholeStatistics?: StatisticsFilter) => {
    const allBorrowings = filterForWholeStatistics
      ? this._getFilteredBorrowings(
          filterForWholeStatistics.sqliteExpression || "",
          filterForWholeStatistics.bindParams
        )
      : this._getFilteredBorrowings();

    return this._countTags(allBorrowings);
  };
}
