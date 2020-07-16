export type UserID = number;

export interface User {
  user_id: UserID;
  name: string;
  date_of_birth?: number | null;
  phone_number?: string | null;
  is_suspended: 0 | 1;
  game_taken?: number | null;
}
