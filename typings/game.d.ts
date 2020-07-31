export type GameID = number;

export interface Game {
  game_id: GameID;
  name: string;
  is_suspended: 0 | 1;
  user_with_the_game: number;
}

export interface AddGameOptions {
  name: string;
  is_suspended?: boolean;
}

export interface UpdateGameNameOptions {
  game_id: GameID;
  newName: string;
}
