/** @jsx jsx */
import { jsx } from "@emotion/core";
import { HashRouter, Switch, Route } from "react-router-dom";
import { Home } from "./screens/Home";
import { Users } from "./screens/Users";
import { Games } from "./screens/Games";
import { AddGame } from "./screens/AddGame";
import { Routes } from "./constants/routes";
import { BorrowGame } from "./screens/BorrowGame";
import { ReturnGame } from "./screens/ReturnGame";
import { AddUser } from "./screens/AddUser";
import { useTheme } from "@material-ui/core/styles";
import { Statistics } from "./screens/Statistics";
import { Attendance } from "./screens/Attendance";

const App: React.FC = () => {
  const theme = useTheme();

  return (
    <HashRouter>
      <div
        className="App"
        css={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          justifyContent: "stretch",
        }}
      >
        <div
          css={{
            width: "100vw",
            height: "100vh",
            zIndex: -1,
            position: "fixed",
            top: 0,
            left: 0,
            backgroundColor: theme.palette.background.default,
          }}
        ></div>

        <Switch>
          <Route path={Routes.ATTENDANCE} component={Attendance} />
          <Route path={Routes.STATISTICS} component={Statistics} />
          <Route path={Routes.USERS} component={Users} />
          <Route path={Routes.GAMES} component={Games} />
          <Route path={Routes.BORROW_GAME} component={BorrowGame} />
          <Route path={Routes.ADD_GAME} component={AddGame} />
          <Route path={Routes.ADD_USER} component={AddUser} />
          <Route path={Routes.RETURN_GAME_BASE} component={ReturnGame} />
          <Route path={Routes.HOME} component={Home} />
        </Switch>
      </div>
    </HashRouter>
  );
};

export default App;
