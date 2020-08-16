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
  SESSIONS_CHANNEL_CHANGED,
  ATTENDANCE_CHANNEL_CHANGED,
} from "../src/constants/tables";
import StatisticsService from "./services/StatisticsService";
import AttendanceService from "./services/AttendanceService";
import { ErrorWrapper } from "../src/typings/tables";
import getAppDataDir from "./utils/getAppDataDir";

if (!("toJSON" in Error.prototype))
  Object.defineProperty(Error.prototype, "toJSON", {
    value: function () {
      var alt = {};

      Object.getOwnPropertyNames(this).forEach(function (key) {
        // @ts-ignore
        alt[key] = this[key];
      }, this);

      return alt;
    },
    configurable: true,
    writable: true,
  });

// import installExtension, {
//   REACT_DEVELOPER_TOOLS,
// } from "electron-devtools-installer";

const registerIpcFunc = <FnParams extends any[], FnReturnType>(
  channel: string,
  func: (...args: FnParams) => FnReturnType
) =>
  ipcMain.on(channel, (evt, ...args) => {
    try {
      evt.returnValue = {
        payload: func(...(args as FnParams)),
        isError: false,
      } as ErrorWrapper<FnReturnType>;
    } catch (e) {
      console.error(e);
      evt.returnValue = {
        isError: true,
        payload: e,
      } as ErrorWrapper<any>;
    }
  });

let win: BrowserWindow | null = null;

const db = Database(join(getAppDataDir(), "database.db"));

const closeDB = (db: InstanceType<typeof Database>) => {
  if (db.open) db.close();
};

const tablesService = new TablesService(db);
const usersService = new UsersService(db);
const gamesService = new GamesService(db);
const statisticsService = new StatisticsService(db);
const attendanceService = new AttendanceService(db);

const onGamesChanged = () => {
  win?.webContents.send(GAMES_CHANGED_CHANNEL);
};
const onUsersChanged = () => {
  win?.webContents.send(USERS_CHANGED_CHANNEL);
};
const onSessionsChanged = () => {
  win?.webContents.send(SESSIONS_CHANNEL_CHANGED);
};
const onAttendanceChanged = () => {
  win?.webContents.send(ATTENDANCE_CHANNEL_CHANGED);
};

usersService.createNotifierTriggers(onUsersChanged);
gamesService.createNotifierTriggers(onGamesChanged);
attendanceService.createSessionsNotifierTriggers(onSessionsChanged);

const settingsService = new SettingsService<Settings>(
  join(getAppDataDir(), "settings.json")
);

// Games
registerIpcFunc("getAllGames", gamesService.getAllGames);
registerIpcFunc("getGame", gamesService.getGame);
registerIpcFunc("getAllGameTags", gamesService.getAllGameTags);

registerIpcFunc("suspendGame", gamesService.suspendGame);
registerIpcFunc("unsuspendGame", gamesService.unsuspendGame);
registerIpcFunc("removeGame", gamesService.removeGame);
registerIpcFunc("addGame", gamesService.addGame);
registerIpcFunc("updateGameName", gamesService.updateGameName);
registerIpcFunc("borrowGame", gamesService.borrowGame);
registerIpcFunc("updateGameTags", gamesService.updateGameTags);
registerIpcFunc("returnGame", gamesService.returnGame);

// Users
registerIpcFunc("getAllUsers", usersService.getAllUsers);
registerIpcFunc("getUser", usersService.getUser);

registerIpcFunc("removeUser", usersService.removeUser);
registerIpcFunc("updateUserName", usersService.updateUserName);
registerIpcFunc("suspendUser", usersService.suspendUser);
registerIpcFunc("unsuspendUser", usersService.unsuspendUser);
registerIpcFunc("addUser", usersService.addUser);
registerIpcFunc("updateUserPhoneNumber", usersService.updateUserPhoneNumber);
registerIpcFunc("updateUserDateOfBirth", usersService.updateUserDateOfBirth);

// Statistics
registerIpcFunc("getAllBorrowings", statisticsService.getAllBorrowings);
registerIpcFunc("getBorrowing", statisticsService.getBorrowing);
registerIpcFunc("getGameBorrowings", statisticsService.getGameBorrowings);
registerIpcFunc("getGameStatistics", statisticsService.getGameStatistics);
registerIpcFunc("getTagsCount", statisticsService.getTagsCount);
registerIpcFunc("getUserBorrowings", statisticsService.getUserBorrowings);
registerIpcFunc("getUserStatistics", statisticsService.getUserStatistics);

// Attendance
registerIpcFunc("closeSession", attendanceService.closeSession);
registerIpcFunc(
  "markUserForCurrentSession",
  attendanceService.markUserForCurrentSession
);
registerIpcFunc("startSession", attendanceService.startSession);

registerIpcFunc("isThereOpenSession", attendanceService.isThereOpenSession);
registerIpcFunc(
  "getUserAttendanceData",
  attendanceService.getUserAttendanceData
);
registerIpcFunc("getSession", attendanceService.getSession);
registerIpcFunc("getCurrentSession", attendanceService.getCurrentSession);
registerIpcFunc("getAllAttendanceData", attendanceService.getAllAttendanceData);
registerIpcFunc("getAllSessions", attendanceService.getAllSessions);

// Others
registerIpcFunc("updateSettings", settingsService.updateSettings);
registerIpcFunc("getSettings", settingsService.getSettings);
registerIpcFunc(
  "getCurrentBorrowersAndGames",
  tablesService.getCurrentBorrowersAndGames
);

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
    closeDB(db);
  }
});

app.on("activate", () => {
  if (win === null) {
    createWindow();
  }
});

process.on("exit", () => closeDB(db));
