export enum Routes {
  HOME = "/",
  USERS = "/users",
  GAMES = "/games",
  BORROW_GAME = "/borrow-game",
  ADD_GAME = "/add-game",
  RETURN_GAME_BASE = "/return-game",
  ADD_USER = "/add-user",
  STATISTICS = "/statistics",
  ATTENDANCE = "/attendance",
}

export enum ReturnGameQueryParams {
  user_id = "user_id",
  game_id = "game_id",
}
