import { UserID } from "./user";
import { GameID } from "./game";
import { SessionID } from "./attendance";

export type BorrowingID = number;

export interface Borrowing {
  borrower_id: UserID;
  game_id: GameID;
  date_borrowed: number;
  date_returned?: number;
  borrowing_id: BorrowingID;
}

export interface BorrowerAndGame {
  game_id: GameID;
  user_id: UserID;
  date_borrowed: number;
  session_when_borrowed: SessionID;
  game_name: string;
  user_name: string;
}

export interface BorrowingAndGameData {
  borrower_id: UserID;
  game_id: GameID;
  date_borrowed: number;
  date_returned?: number;
  name: string;
  tags?: string;
  borrowing_id: BorrowingID;
  session_when_borrowed: SessionID;
}

export interface StatisticsFilter {
  sqliteExpression: string;
  bindParams: any[];
}

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
