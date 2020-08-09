import { UserID } from "./user";
import { GameID } from "./game";

export interface Borrowing {
  borrower_id: UserID;
  game_id: GameID;
  date_borrowed: number;
  date_returned?: number;
}
