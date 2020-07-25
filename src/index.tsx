import React from "react";
import ReactDOM from "react-dom";
import "typeface-roboto";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { ThemeProvider as EmotionProvider } from "emotion-theming";
import { getSettings } from "./services/settingsServices";
import { defaultLightTheme } from "./themes/defaultLightTheme";
import {
  StylesProvider,
  ThemeProvider as MuiProvider,
  createMuiTheme,
} from "@material-ui/core/styles";
import { SnackbarProvider } from "notistack";

const theme = getSettings()?.theme || defaultLightTheme;

ReactDOM.render(
  <StylesProvider injectFirst>
    <MuiProvider
      theme={createMuiTheme({
        palette: {
          primary: { main: theme.primaryColor },
          secondary: { main: theme.secondaryColor },
          text: {
            primary: theme.primaryTextColor,
            secondary: theme.secondaryTextColor,
          },
        },
        overrides: {
          MuiTooltip: { tooltip: { fontSize: 12, fontWeight: 300 } },
        },
      })}
    >
      <EmotionProvider theme={theme}>
        <SnackbarProvider maxSnack={3}>
          <App />
        </SnackbarProvider>
      </EmotionProvider>
    </MuiProvider>
  </StylesProvider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
