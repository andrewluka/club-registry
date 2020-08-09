import React from "react";
import ReactDOM from "react-dom";
import "typeface-roboto";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { getSettings } from "./services/settingsServices";
import { defaultLightTheme } from "./themes/defaultLightTheme";
import {
  StylesProvider,
  ThemeProvider,
  createMuiTheme,
} from "@material-ui/core/styles";
import { SnackbarProvider } from "notistack";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";

const themeOptions = getSettings()?.theme || defaultLightTheme;

const muiTheme = createMuiTheme({
  overrides: {
    MuiTooltip: { tooltip: { fontSize: 12, fontWeight: 300 } },
    MuiTableFooter: {
      root: {
        "& div": {
          justifyContent: "flex-start",
        },
      },
    },
  },
  ...themeOptions,
});

ReactDOM.render(
  <MuiPickersUtilsProvider utils={MomentUtils}>
    <StylesProvider injectFirst>
      <ThemeProvider theme={muiTheme}>
        <SnackbarProvider maxSnack={3}>
          <App />
        </SnackbarProvider>
      </ThemeProvider>
    </StylesProvider>
  </MuiPickersUtilsProvider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
