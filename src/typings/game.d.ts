import { UserID } from "./user";

export type GameID = number;

export interface Game {
  game_id: GameID;
  name: string;
  is_suspended: 0 | 1;
  borrowing?: number;
  // only allow alphanumeric characters and space, delimited by semicolon
  tags?: string | null;
  date_of_addition: number;
}

export interface AddGameOptions {
  name: string;
  is_suspended?: boolean;
  tags?: string[] | null;
}

export interface UpdateGameNameOptions {
  game_id: GameID;
  newName: string;
}

export interface BorrowAndReturnGameOptions {
  borrower: UserID;
  game: GameID;
}

export interface UpdateGameTagsOptions {
  game_id: GameID;
  newTags: string[];
}
