export type UserID = number;

export interface User {
  user_id: UserID;
  name: string;
  date_of_birth?: number | null;
  phone_number?: string | null;
  is_suspended: 0 | 1;
  borrowing?: number | null;
  date_of_addition: number;
}

export interface AddUserOptions {
  name: string;
  date_of_birth?: number | null;
  phone_number?: string | null;
  is_suspended?: boolean;
}

export interface UpdateUserNameOptions {
  user_id: UserID;
  newName: string;
}
