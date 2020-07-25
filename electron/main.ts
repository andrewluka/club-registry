import { app, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import * as isDev from "electron-is-dev";
import SettingsService from "./services/SettingsService";
import { Settings } from "../typings/settings";
import Database from "better-sqlite3";
import TablesService from "./services/TablesService";
import UsersService from "./services/UsersService";
import GamesService from "./services/GamesService";
import { AddGameOptions } from "../typings/game";
// import installExtension, {
//   REACT_DEVELOPER_TOOLS,
// } from "electron-devtools-installer";

const registerIpcGetter = (channel: string, valueGetter: Function) =>
  ipcMain.on(channel, (evt) => {
    evt.returnValue = valueGetter();
  });

const getAppDataDir = () => {
  return join(
    process.env.APPDATA ||
      (process.platform == "darwin"
        ? process.env.HOME + "/Library/Preferences"
        : process.env.HOME + "/.local/share"),
    "club-registry"
  );
};

let win: BrowserWindow | null = null;

const db = Database(join(getAppDataDir(), "database.db"));

const tablesService = new TablesService(db);
const usersService = new UsersService(db);
const gamesService = new GamesService(db);

gamesService.addGame({ name: "testing" });

const settingsService = new SettingsService<Settings>(
  join(getAppDataDir(), "settings.json")
);

registerIpcGetter("getSettings", settingsService.getSettings);
registerIpcGetter("getBorrowersAndGames", tablesService.getBorrowersAndGames);
registerIpcGetter("getAllUsers", usersService.getAllUsers);
registerIpcGetter("getAllGames", gamesService.getAllGames);

ipcMain.on("suspendGame", (evt, game_id) => {
  try {
    gamesService.suspendGame(game_id);
    evt.returnValue = true;
  } catch (e) {
    evt.returnValue = false;
  }
});

ipcMain.on("unsuspendGame", (evt, game_id) => {
  try {
    gamesService.unsuspendGame(game_id);
    evt.returnValue = true;
  } catch (e) {
    evt.returnValue = false;
  }
});

ipcMain.on("removeGame", (evt, game_id) => {
  try {
    gamesService.removeGame(game_id);
    evt.returnValue = true;
  } catch (e) {
    console.log(e);
    evt.returnValue = false;
  }
});

ipcMain.on("addGame", (evt, options: AddGameOptions) => {
  try {
    evt.returnValue = gamesService.addGame(options);
  } catch (e) {
    evt.returnValue = false;
  }
});

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  isDev ? "" : win.setMenu(null);

  win.loadURL(
    isDev
      ? "http://localhost:3000/index.html"
      : `file://${__dirname}/../index.html`
  );

  win.on("closed", () => (win = null));

  // Hot Reloading
  if (isDev) {
    // 'node_modules/.bin/electronPath'
    require("electron-reload")(__dirname, {
      electron: join(__dirname, "..", "..", "node_modules", ".bin", "electron"),
      forceHardReset: true,
      hardResetMethod: "exit",
    });
  }

  // // DevTools
  // installExtension(REACT_DEVELOPER_TOOLS)
  //   .then((name) => console.log(`Added Extension:  ${name}`))
  //   .catch((err) => console.log("An error occurred: ", err));

  if (isDev) {
    win.webContents.openDevTools();
  }
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (win === null) {
    createWindow();
  }
});
