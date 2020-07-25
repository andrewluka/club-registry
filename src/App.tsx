/** @jsx jsx */
import { jsx } from "@emotion/core";
import { HashRouter, Switch, Route } from "react-router-dom";
import { Home } from "./screens/Home";
import { Users } from "./screens/Users";
import { Games } from "./screens/Games";
import { AddGame } from "./screens/AddGame";
import { Routes } from "./routes";
import { useTheme } from "emotion-theming";
import { Theme } from "../typings/theme";
import { BorrowGame } from "./screens/BorrowGame";

const App: React.FC = () => {
  const theme = useTheme<Theme>();

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
          // alignItems: "center",
          // justifyContent: "center",
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
            backgroundColor: theme.backgroundColor,
          }}
        ></div>

        <Switch>
          <Route path={Routes.USERS} component={Users} />
          <Route path={Routes.GAMES} component={Games} />
          <Route path={Routes.BORROW_GAME} component={BorrowGame} />
          <Route path={Routes.ADD_GAME} component={AddGame} />
          <Route path={Routes.HOME} component={Home} />
        </Switch>
      </div>
    </HashRouter>
  );
};

export default App;
