import { Database } from "better-sqlite3";
import TablesService from "./TablesService";
import { Borrowing } from "../../src/typings/statistics";
import { UserID } from "../../src/typings/user";
import { GameID } from "../../src/typings/game";
import { GAMES_TAGS_DELIMITER } from "../../src/constants/tables";

export interface BorrowingAndGameData {
  borrower_id: UserID;
  game_id: GameID;
  date_borrowed: number;
  date_returned: number;
  name: string;
  tags: string;
}

export type StatisticsFilter = (borrowing: BorrowingAndGameData) => boolean;
export type CountingRecord<KeyType extends number | string> = Record<
  KeyType,
  number
>;

export interface UserStatistics {
  allBorrowings: BorrowingAndGameData[];
  gamesBorrowingsCount: CountingRecord<GameID>;
  tagsBorrowedCount: CountingRecord<string>;
}

export interface GameStatistics {
  allBorrowings: BorrowingAndGameData[];
  borrowersCount: CountingRecord<UserID>;
}

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

  private _getAllBorrowings = (
    whereClauseConditions?: string,
    ...bindParams: any[]
  ): BorrowingAndGameData[] =>
    this.db
      .prepare(
        `
        SELECT 
          borrowings.borrower_id,
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

  getAllBorrowings = (): Borrowing[] =>
    this.db.prepare("SELECT * FROM borrowings").all();

  private _countTags = (
    borrowings: BorrowingAndGameData[]
  ): CountingRecord<string> => {
    const splitBorrowingTags = ({ tags }: BorrowingAndGameData) =>
      tags.split(GAMES_TAGS_DELIMITER);

    const allTags = borrowings.flatMap(splitBorrowingTags);
    const countFrequency = getFrequencyCounter((x: string) => x);

    return allTags.reduce(countFrequency, {});
  };

  getUserStatistics = (
    user_id: UserID,
    filterForWholeStatistics?: StatisticsFilter
  ): UserStatistics => {
    const getBorrowings = () =>
      this._getAllBorrowings("borrower_id = ?", user_id);
    const allBorrowings = filterForWholeStatistics
      ? getBorrowings().filter(filterForWholeStatistics)
      : getBorrowings();

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
    const getBorrowings = () =>
      this._getAllBorrowings("games.game_id = ?", game_id);
    const allBorrowings = filterForWholeStatistics
      ? getBorrowings().filter(filterForWholeStatistics)
      : getBorrowings();

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
    const getBorrowings = () => this._getAllBorrowings();
    const allBorrowings = filterForWholeStatistics
      ? getBorrowings().filter(filterForWholeStatistics)
      : getBorrowings();

    return this._countTags(allBorrowings);
  };
}
