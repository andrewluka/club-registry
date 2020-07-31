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

const registerIpcGetter = <T extends any[]>(
  channel: string,
  getter: (...args: T) => any
) =>
  ipcMain.on(channel, (evt, ...args) => {
    evt.returnValue = getter(...(args as T));
  });

// updateGameName

const registerIpcSetter = <T extends any[]>(
  channel: string,
  setter: (...args: T) => void
) =>
  ipcMain.on(channel, (evt, ...args) => {
    try {
      setter(...(args as T));
      evt.returnValue = true;
    } catch (e) {
      console.log(e);
      evt.returnValue = false;
    }
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

const onGamesChanged = () => {
  win?.webContents.send("games_changed");
};
const onUsersChanged = () => {
  win?.webContents.send("users_changed");
};

usersService.createNotifierTriggers(onUsersChanged);
gamesService.createNotifierTriggers(onGamesChanged);

const settingsService = new SettingsService<Settings>(
  join(getAppDataDir(), "settings.json")
);

registerIpcGetter("getSettings", settingsService.getSettings);
registerIpcGetter("getBorrowersAndGames", tablesService.getBorrowersAndGames);
registerIpcGetter("getAllUsers", usersService.getAllUsers);
registerIpcGetter("getAllGames", gamesService.getAllGames);
registerIpcGetter("getGame", gamesService.getGame);

registerIpcSetter("suspendGame", gamesService.suspendGame);
registerIpcSetter("unsuspendGame", gamesService.unsuspendGame);
registerIpcSetter("removeGame", gamesService.removeGame);
registerIpcSetter("addGame", gamesService.addGame);
registerIpcSetter("updateGameName", gamesService.updateGameName);

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
