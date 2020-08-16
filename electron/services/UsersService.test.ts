import { expect } from "chai";
import UsersService from "./UsersService";
import Database from "better-sqlite3";
import GamesService from "./GamesService";
import StatisticsService from "./StatisticsService";
import AttendanceService from "./AttendanceService";

describe("UsersService", function () {
  describe("#addUser", function () {
    it("should add user's data", function () {
      const db = Database(":memory:");
      const usersService = new UsersService(db);

      const name = "ME";
      const date_of_birth = null;
      const phone_number = "20193932";

      const user_id = usersService.addUser({
        name,
        date_of_birth,
        phone_number,
      });

      const user = usersService.getUser(user_id);

      expect(user?.name).to.equal(name);
      expect(user?.date_of_birth).to.equal(date_of_birth);
      expect(user?.phone_number).to.equal(phone_number);
      expect(user_id).to.be.greaterThan(-1);
      expect(Number(user?.user_id)).to.equal(user_id);
      expect(user?.date_of_addition).to.be.a("number");
    });
  });

  describe("#getUser", function () {
    it("should return all the data of the user with the given user_id", function () {
      const db = Database(":memory:");
      const usersService = new UsersService(db);

      const name = "ME";
      const date_of_birth = null;
      const phone_number = "20193932";

      const user_id = usersService.addUser({
        name,
        date_of_birth,
        phone_number,
      });

      const user = usersService.getUser(user_id);

      expect(user?.name).to.equal(name);
      expect(user?.date_of_birth).to.equal(date_of_birth);
      expect(user?.phone_number).to.equal(phone_number);
    });

    it("should return undefined if there is no user with the given user_id", function () {
      const db = Database(":memory:");
      const usersService = new UsersService(db);

      expect(usersService.getUser(769)).to.be.undefined;
    });
  });

  describe("#removeUser", function () {
    it("should remove user and all of the user's borrowing data", function () {
      const db = Database(":memory:");
      const usersService = new UsersService(db);
      const gamesService = new GamesService(db);
      const statisticsService = new StatisticsService(db);
      const attendanceService = new AttendanceService(db);

      attendanceService.startSession();

      const game_id = gamesService.addGame({ name: "game name" });
      const user_id = usersService.addUser({ name: "user name" });

      gamesService.borrowGame({ borrower: user_id, game: game_id });
      gamesService.returnGame({ borrower: user_id, game: game_id });

      usersService.removeUser(user_id);
      const userBorrowings = statisticsService.getUserBorrowings(user_id);

      expect(userBorrowings.length).to.equal(0);
      expect(usersService.getUser(user_id)).to.be.undefined;
    });

    it("should throw if user has borrowed a game", function () {
      const db = Database(":memory:");
      const usersService = new UsersService(db);
      const gamesService = new GamesService(db);
      const attendanceService = new AttendanceService(db);

      attendanceService.startSession();

      let e: any;

      const game_id = gamesService.addGame({ name: "game name" });
      const user_id = usersService.addUser({ name: "user name" });

      gamesService.borrowGame({ borrower: user_id, game: game_id });

      try {
        usersService.removeUser(Number(user_id));
      } catch (e_) {
        e = e_;
      }

      expect(Boolean(e)).to.be.true;
    });

    it("should throw when user does not exist", function () {
      const db = Database(":memory:");
      const usersService = new UsersService(db);

      let e: any;

      try {
        usersService.removeUser(8);
      } catch (e_) {
        e = e_;
      }

      expect(Boolean(e)).to.be.true;
    });
  });

  describe("#hasUserBorrowedGame", function () {
    it("should return the correct boolean value", function () {
      const db = Database(":memory:");
      const usersService = new UsersService(db);
      const gamesService = new GamesService(db);
      const attendanceService = new AttendanceService(db);

      attendanceService.startSession();

      const game_id = gamesService.addGame({ name: "game name" });
      const user_id = usersService.addUser({ name: "user name" });

      gamesService.borrowGame({ borrower: user_id, game: game_id });
      expect(usersService.hasUserBorrowedGame(user_id)).to.be.true;

      gamesService.returnGame({ borrower: user_id, game: game_id });
      expect(usersService.hasUserBorrowedGame(user_id)).to.be.false;
    });

    it("should throw if user does not exist", function () {
      const db = Database(":memory:");
      const usersService = new UsersService(db);

      let e: any;

      try {
        usersService.hasUserBorrowedGame(98);
      } catch (e_) {
        e = e_;
      }

      expect(Boolean(e)).to.be.true;
    });
  });

  describe("#userExists", function () {
    it("should return correct boolean value", function () {
      const db = Database(":memory:");
      const usersService = new UsersService(db);

      const user_id = usersService.addUser({ name: "name" });

      expect(usersService.userExists(user_id)).to.be.true;
      expect(usersService.userExists(645)).to.be.false;
    });
  });

  describe("#suspendUser", function () {
    it("should suspend user by setting is_suspended to 1 (true)", function () {
      const db = Database(":memory:");
      const usersService = new UsersService(db);

      const user_id = usersService.addUser({ name: "user" });

      usersService.suspendUser(user_id);

      const { is_suspended } = usersService.getUser(user_id) || {};
      expect(is_suspended).to.equal(1);
    });

    it("should throw if user does not exist", function () {
      const db = Database(":memory:");
      const usersService = new UsersService(db);

      let e: any;

      try {
        usersService.suspendUser(87);
      } catch (e_) {
        e = e_;
      }

      expect(Boolean(e)).to.be.true;
    });

    it("should throw if user has borrowed a game", function () {
      const db = Database(":memory:");
      const usersService = new UsersService(db);
      const gamesService = new GamesService(db);
      const attendanceService = new AttendanceService(db);

      attendanceService.startSession();

      const game_id = gamesService.addGame({ name: "game" });
      const user_id = usersService.addUser({ name: "user" });

      gamesService.borrowGame({ borrower: user_id, game: game_id });

      let e: any;

      try {
        usersService.suspendUser(user_id);
      } catch (e_) {
        e = e_;
      }

      expect(Boolean(e)).to.be.true;
    });
  });

  describe("#unsuspendUser", function () {
    it("should unsuspend user by setting is_suspended to 0 (false)", function () {
      const db = Database(":memory:");
      const usersService = new UsersService(db);

      const user_id = usersService.addUser({ name: "m" });

      usersService.suspendUser(user_id);
      usersService.unsuspendUser(user_id);

      const { is_suspended } = usersService.getUser(user_id) || {};
      expect(is_suspended).to.equal(0);
    });

    it("should throw when user does not exist", function () {
      const db = Database(":memory:");
      const usersService = new UsersService(db);

      let e: any;

      try {
        usersService.unsuspendUser(87);
      } catch (e_) {
        e = e_;
      }

      expect(Boolean(e)).to.be.true;
    });
  });

  describe("#getAllUsers", function () {
    it("should return all users' data", function () {
      const db = Database(":memory:");
      const usersService = new UsersService(db);

      const name = "me";

      usersService.addUser({ name });

      const users = usersService.getAllUsers();

      expect(users.length).to.equal(1);
      expect(users[0].name).to.equal(name);
    });
  });

  describe("#createNotifierTriggers", function () {
    it("should create temp triggers on insert, update and delete", function () {
      const db = Database(":memory:");
      const usersService = new UsersService(db);

      let x = 0;

      const inc = () => (x += 1);

      usersService.createNotifierTriggers(inc);

      const game_id = usersService.addUser({ name: "name" });
      expect(x).to.equal(1);

      db.prepare("UPDATE users SET name = ?").run("lol");
      expect(x).to.equal(2);

      usersService.removeUser(game_id);
      expect(x).to.equal(3);
    });
  });

  describe("#updateUserName", function () {
    it("should update user's name to new name", function () {
      const db = Database(":memory:");
      const usersService = new UsersService(db);

      const user_id = usersService.addUser({ name: "random name here" });
      const newName = "new name";

      usersService.updateUserName({ user_id, newName });

      expect(usersService.getUser(user_id)?.name).to.equal(newName);
    });

    it("should throw if user does not exist", function () {
      const db = Database(":memory:");
      const usersService = new UsersService(db);

      let e: any;

      try {
        usersService.updateUserName({ user_id: 7, newName: "not there :(" });
      } catch (e_) {
        e = e_;
      }

      expect(Boolean(e)).to.be.true;
    });
  });
});
