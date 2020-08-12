import { app, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import * as isDev from "electron-is-dev";
import SettingsService from "./services/SettingsService";
import { Settings } from "../src/typings/settings";
import Database from "better-sqlite3";
import TablesService from "./services/TablesService";
import UsersService from "./services/UsersService";
import GamesService from "./services/GamesService";
import {
  GAMES_CHANGED_CHANNEL,
  USERS_CHANGED_CHANNEL,
} from "../src/constants/tables";

// import installExtension, {
//   REACT_DEVELOPER_TOOLS,
// } from "electron-devtools-installer";

const registerIpcGetter = <FnParams extends any[], FnReturnType>(
  channel: string,
  getter: (...args: FnParams) => FnReturnType
) =>
  ipcMain.on(channel, (evt, ...args) => {
    evt.returnValue = getter(...(args as FnParams));
  });

const registerIpcSetter = <FnParams extends any[]>(
  channel: string,
  setter: (...args: FnParams) => void
) =>
  ipcMain.on(channel, (evt, ...args) => {
    try {
      setter(...(args as FnParams));
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
  win?.webContents.send(GAMES_CHANGED_CHANNEL);
};
const onUsersChanged = () => {
  win?.webContents.send(USERS_CHANGED_CHANNEL);
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
registerIpcGetter("getUser", usersService.getUser);
registerIpcGetter("getGameTypes", gamesService.getAllGameTags);
registerIpcGetter("getAllGameTags", gamesService.getAllGameTags);

registerIpcSetter("suspendGame", gamesService.suspendGame);
registerIpcSetter("unsuspendGame", gamesService.unsuspendGame);
registerIpcSetter("removeGame", gamesService.removeGame);
registerIpcSetter("addGame", gamesService.addGame);
registerIpcSetter("updateGameName", gamesService.updateGameName);
registerIpcSetter("borrowGame", gamesService.borrowGame);
registerIpcSetter("removeUser", usersService.removeUser);
registerIpcSetter("updateUserName", usersService.updateUserName);
registerIpcSetter("suspendUser", usersService.suspendUser);
registerIpcSetter("unsuspendUser", usersService.unsuspendUser);
registerIpcSetter("returnGame", gamesService.returnGame);
registerIpcSetter("addUser", usersService.addUser);
registerIpcSetter("updateGameTags", gamesService.updateGameTags);
registerIpcSetter("updateUserPhoneNumber", usersService.updateUserPhoneNumber);
registerIpcSetter("updateUserDateOfBirth", usersService.updateUserDateOfBirth);
registerIpcSetter("updateSettings", settingsService.updateSettings);

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 400,
    minHeight: 250,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  win.setMenu(null);

  win.loadURL(
    isDev
      ? "http://localhost:3000/index.html"
      : `file://${__dirname}/../index.html`
  );

  win.on("closed", () => (win = null));

  // Hot Reloading
  if (isDev) {
    // 'node_modules/.bin/electronPath'
    require("electron-reload")(
      __dirname
      //    ,{
      //   electron: join(
      //     __dirname,
      //     `../node_modules/.bin/electron${
      //       process.platform === "win32" ? ".cmd" : ""
      //     }`
      //   ),
      //   forceHardReset: true,
      //   hardResetMethod: "exit",
      // }
    );
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
