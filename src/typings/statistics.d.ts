import { UserID } from "./user";
import { GameID } from "./game";

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

  game_name: string;
  user_name: string;
}

export interface BorrowingAndGameData {
  borrower_id: UserID;
  game_id: GameID;
  date_borrowed: number;
  date_returned: number;
  name: string;
  tags: string;
  borrowing_id: BorrowingID;
}
