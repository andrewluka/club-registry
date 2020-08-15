import { expect } from "chai";
import Database from "better-sqlite3";
import GamesService from "./GamesService";
import { Game } from "../../src/typings/game";
import UsersService from "./UsersService";
import { GAMES_TAGS_DELIMITER } from "../../src/constants/tables";
import { User } from "../../src/typings/user";
import StatisticsService from "./StatisticsService";

describe("GamesService", function () {
  describe("#addGame", function () {
    it("should add game, with all required and specified fields and return the game id", function () {
      const db = Database(":memory:");
      const gamesService = new GamesService(db);

      const name = "rando";
      const tag = "hello";

      const game_id = gamesService.addGame({ name, tags: [tag, tag] });
      const game: Game | undefined = db
        .prepare("SELECT * FROM games WHERE game_id = ?")
        .all(game_id)[0];

      const tags = game?.tags?.split(GAMES_TAGS_DELIMITER);

      expect(game?.name).to.equal(name);
      expect(game?.is_suspended).to.equal(0);
      expect(game?.borrowing).to.equal(null);
      expect(tags?.[0]).to.equal(tag);
      expect(tags?.length).to.equal(1);
      expect(game_id).to.be.greaterThan(0);
      expect(Number(game?.game_id)).to.equal(game_id);
      expect(game?.date_of_addition).to.be.a("number");
    });
  });

  describe("#getGame", function () {
    const db = Database(":memory:");
    const gamesService = new GamesService(db);

    it("should return game with the specified game_id with all its fields", function () {
      const name = "rando";

      const game_id = gamesService.addGame({ name });
      const game = gamesService.getGame(game_id);

      expect(game?.name).to.equal(name);
    });

    it("should return undefined if the game with the specified game_id does not exist", function () {
      expect(gamesService.getGame(87)).to.be.undefined;
    });
  });

  describe("#removeGame", function () {
    const db = Database(":memory:");
    const gamesService = new GamesService(db);
    const usersService = new UsersService(db);

    it("should remove game and its borrowing data", function () {
      const game_id = gamesService.addGame({ name: "name" });
      const user_id = usersService.addUser({ name: "random user" });

      gamesService.borrowGame({ borrower: user_id, game: game_id });
      gamesService.returnGame({ borrower: user_id, game: game_id });

      gamesService.removeGame(Number(game_id));

      const borrowings = db
        .prepare("SELECT * FROM borrowings WHERE game_id = ?")
        .all(game_id);

      expect(borrowings.length).to.equal(0);

      const gameExists = gamesService.gameExists(game_id);
      expect(gameExists).to.be.false;
    });

    it("should throw if game does not exist", function () {
      let e: any;

      try {
        gamesService.removeGame(9);
      } catch (e_) {
        e = e_;
      }

      expect(Boolean(e)).to.be.true;
    });

    it("should throw if game has been borrowed", function () {
      let e: any;

      const game_id = gamesService.addGame({ name: "name" });
      const user_id = usersService.addUser({ name: "random name" });

      gamesService.borrowGame({ borrower: user_id, game: game_id });

      try {
        gamesService.removeGame(game_id);
      } catch (e_) {
        e = e_;
      }

      expect(Boolean(e)).to.be.true;
    });
  });

  describe("#isGameBorrowed", function () {
    it("should return correct boolean value", function () {
      const db = Database(":memory:");
      const gamesService = new GamesService(db);
      const usersService = new UsersService(db);

      const game_id = gamesService.addGame({ name: "name" });
      const user_id = usersService.addUser({ name: "random name" });

      gamesService.borrowGame({ borrower: user_id, game: game_id });
      expect(gamesService.isGameBorrowed(game_id)).to.be.true;

      const game_id2 = gamesService.addGame({ name: "name" });
      expect(gamesService.isGameBorrowed(game_id2)).to.be.false;
    });

    it("should throw when game does not exist", function () {
      const db = Database(":memory:");
      const gamesService = new GamesService(db);

      let e: any;

      try {
        gamesService.isGameBorrowed(67);
      } catch (e_) {
        e = e_;
      }

      expect(Boolean(e)).to.be.true;
    });
  });

  describe("#gameExists", function () {
    it("should return correct boolean value", function () {
      const db = Database(":memory:");
      const gamesService = new GamesService(db);

      const game_id = gamesService.addGame({ name: "random name" });

      expect(gamesService.gameExists(game_id)).to.be.true;
      expect(gamesService.gameExists(645)).to.be.false;
    });
  });

  describe("#suspendGame", function () {
    it("should set is_suspended to 1 (true) aka suspend the game", function () {
      const db = Database(":memory:");
      const gamesService = new GamesService(db);

      const game_id = gamesService.addGame({ name: "random name" });
      gamesService.suspendGame(game_id);

      const game: Game | undefined = db
        .prepare(`SELECT * FROM games WHERE game_id = ?`)
        .all(game_id)[0];

      expect(game?.is_suspended).to.equal(1);
    });

    it("should throw when game does not exist", function () {
      const db = Database(":memory:");
      const gamesService = new GamesService(db);

      let e: any;

      try {
        gamesService.suspendGame(7);
      } catch (e_) {
        e = e_;
      }

      expect(Boolean(e)).to.be.true;
    });
  });

  describe("#unsuspendGame", function () {
    it("should set is_suspended to 0 (false) aka unsuspend the game", function () {
      const db = Database(":memory:");
      const gamesService = new GamesService(db);

      let e: any;

      try {
        gamesService.unsuspendGame(7);
      } catch (e_) {
        e = e_;
      }

      expect(Boolean(e)).to.be.true;

      const game_id = gamesService.addGame({ name: "name" });

      gamesService.suspendGame(game_id);
      gamesService.unsuspendGame(game_id);

      const { is_suspended } = db
        .prepare(`SELECT is_suspended FROM games WHERE game_id = ?`)
        .all(game_id)[0];

      expect(is_suspended).to.equal(0);
    });

    it("should throw when game does not exist", function () {
      const db = Database(":memory:");
      const gamesService = new GamesService(db);

      let e: any;

      try {
        gamesService.unsuspendGame(7);
      } catch (e_) {
        e = e_;
      }

      expect(Boolean(e)).to.be.true;
    });
  });

  describe("#borrowGame", function () {
    it("should add an entry into the borrowings' table and \
'link' user and game to it and return the borrowing's id", function () {
      const db = Database(":memory:");
      const gamesService = new GamesService(db);
      const usersService = new UsersService(db);
      const statisticsService = new StatisticsService(db);

      const user_id = usersService.addUser({ name: "user" });
      const game_id = gamesService.addGame({ name: "game" });

      const borrowing_id = gamesService.borrowGame({
        borrower: user_id,
        game: game_id,
      });

      const game = gamesService.getGame(game_id);
      const user = usersService.getUser(user_id);

      expect(game?.borrowing).to.be.a("number");
      expect(game?.borrowing).to.equal(user?.borrowing).to.equal(borrowing_id);

      const borrowing = statisticsService.getBorrowing(borrowing_id);

      expect(borrowing?.borrower_id).to.equal(user_id);
      expect(borrowing?.game_id).to.equal(game_id);
    });

    it("should throw when user does not exist", function () {
      const db = Database(":memory:");
      const gamesService = new GamesService(db);

      const game_id = gamesService.addGame({ name: "name" });

      let e: any;

      try {
        gamesService.borrowGame({ borrower: 654, game: game_id });
      } catch (e_) {
        e = e_;
      }

      expect(Boolean(e)).to.be.true;
    });

    it("should throw when game does not exist", function () {
      const db = Database(":memory:");
      const gamesService = new GamesService(db);
      const usersService = new UsersService(db);

      const user_id = usersService.addUser({ name: "name" });

      let e: any;

      try {
        gamesService.borrowGame({ borrower: user_id, game: 87 });
      } catch (e_) {
        e = e_;
      }

      expect(Boolean(e)).to.be.true;
    });

    it("should throw when game has already been borrowed", function () {
      const db = Database(":memory:");
      const gamesService = new GamesService(db);
      const usersService = new UsersService(db);

      const user_id1 = usersService.addUser({ name: "name" });
      const user_id2 = usersService.addUser({ name: "name" });
      const game_id = gamesService.addGame({ name: "name" });

      const borrowing = db
        .prepare(
          `
        INSERT INTO borrowings (
          borrower_id, 
          game_id,
          date_borrowed
        ) VALUES (?, ?, ?)
        `
        )
        .run(user_id1, game_id, Date.now()).lastInsertRowid;

      db.prepare(
        `
        UPDATE users 
          SET borrowing = @borrowing 
          WHERE user_id = @borrower
        `
      ).run({
        borrower: user_id1,
        borrowing,
      });

      db.prepare(
        `
        UPDATE games 
          SET borrowing = @borrowing 
          WHERE game_id = @game
        `
      ).run({
        game: game_id,
        borrowing,
      });

      let e: any;

      try {
        gamesService.borrowGame({ borrower: user_id2, game: game_id });
      } catch (e_) {
        e = e_;
      }

      expect(Boolean(e)).to.be.true;
    });

    it("should throw when user has already borrowed a game", function () {
      const db = Database(":memory:");
      const gamesService = new GamesService(db);
      const usersService = new UsersService(db);

      const user_id = usersService.addUser({ name: "name" });
      const game_id1 = gamesService.addGame({ name: "name" });
      const game_id2 = gamesService.addGame({ name: "name" });

      const borrowing = db
        .prepare(
          `
        INSERT INTO borrowings (
          borrower_id, 
          game_id,
          date_borrowed
        ) VALUES (?, ?, ?)
        `
        )
        .run(user_id, game_id1, Date.now()).lastInsertRowid;

      db.prepare(
        `
        UPDATE users 
          SET borrowing = @borrowing 
          WHERE user_id = @borrower
        `
      ).run({
        borrower: user_id,
        borrowing,
      });

      db.prepare(
        `
        UPDATE games 
          SET borrowing = @borrowing 
          WHERE game_id = @game
        `
      ).run({
        game: game_id1,
        borrowing,
      });

      let e: any;

      try {
        gamesService.borrowGame({ borrower: user_id, game: game_id2 });
      } catch (e_) {
        e = e_;
      }

      expect(Boolean(e)).to.be.true;
    });
  });

  describe("#returnGame", function () {
    it("should 'unlink' user and game", function () {
      const db = Database(":memory:");
      const gamesService = new GamesService(db);
      const usersService = new UsersService(db);

      const user_id = usersService.addUser({ name: "name" });
      const game_id = gamesService.addGame({ name: "name" });

      gamesService.borrowGame({ borrower: user_id, game: game_id });
      gamesService.returnGame({ borrower: user_id, game: game_id });

      expect(gamesService.isGameBorrowed(game_id)).to.be.false;
      expect(usersService.hasUserBorrowedGame(user_id)).to.be.false;
    });

    it("should accept only matching game and user and throws otherwise", function () {
      const db = Database(":memory:");
      const gamesService = new GamesService(db);
      const usersService = new UsersService(db);

      const user_id1 = usersService.addUser({ name: "name" });
      const user_id2 = usersService.addUser({ name: "name" });
      const game_id = gamesService.addGame({ name: "name" });

      gamesService.borrowGame({ borrower: user_id1, game: game_id });

      let e: any;

      try {
        gamesService.returnGame({ borrower: user_id2, game: game_id });
      } catch (e_) {
        e = e_;
      }

      expect(Boolean(e)).to.be.true;
    });
  });

  describe("#getAllGames", function () {
    it("should return all games' data", function () {
      const db = Database(":memory:");
      const gamesService = new GamesService(db);

      const name = "a game";

      gamesService.addGame({ name });

      const games = gamesService.getAllGames();

      expect(games.length).to.equal(1);
      expect(games[0].name).to.equal(name);
    });
  });

  describe("#createNotifierTriggers", function () {
    it("should create temp triggers on insert, delete and update", function () {
      const db = Database(":memory:");
      const gamesService = new GamesService(db);

      let x = 0;

      const inc = () => (x += 1);

      gamesService.createNotifierTriggers(inc);

      const game_id = gamesService.addGame({ name: "name" });
      expect(x).to.equal(1);

      db.prepare("UPDATE games SET name = ?").run("lol");
      expect(x).to.equal(2);

      gamesService.removeGame(game_id);
      expect(x).to.equal(3);
    });
  });

  describe("#updateGameName", function () {
    it("should update game name to new one", function () {
      const db = Database(":memory:");
      const gamesService = new GamesService(db);

      const game_id = gamesService.addGame({ name: "random name here" });
      const newName = "new name";

      gamesService.updateGameName({ game_id, newName });

      expect(gamesService.getGame(game_id)?.name).to.equal(newName);
    });

    it("should throw when game doesn't exist", function () {
      const db = Database(":memory:");
      const gamesService = new GamesService(db);

      let e: any;

      try {
        gamesService.updateGameName({ game_id: 7, newName: "not there :(" });
      } catch (e_) {
        e = e_;
      }

      expect(Boolean(e)).to.be.true;
    });
  });

  describe("#updateGameTags", function () {
    it("should completely override old tags \
and removes duplicates from new ones", function () {
      const db = Database(":memory:");
      const gamesService = new GamesService(db);

      const game_id = gamesService.addGame({ name: "random name here" });

      const tag = "hello";
      const tags = [tag, tag, "meIsTag"];

      gamesService.updateGameTags({ game_id, newTags: tags });

      const game = gamesService.getGame(game_id);

      const expectedTags = [...new Set(tags)];
      const actualTags = game?.tags?.split(GAMES_TAGS_DELIMITER);

      expect(actualTags?.length).to.equal(2);
      expect(actualTags).to.deep.equal(expectedTags);
    });

    it("should throw when game does not exist", function () {
      const db = Database(":memory:");
      const gamesService = new GamesService(db);

      let e: any;

      try {
        gamesService.updateGameTags({ game_id: 87, newTags: [":("] });
      } catch (e_) {
        e = e_;
      }

      expect(Boolean(e)).to.be.true;
    });
  });

  describe("#getAllGameTags", function () {
    it("should return an array with all games' tags", function () {
      const db = Database(":memory:");
      const gamesService = new GamesService(db);

      const tags1 = ["a", "b", "c"];
      const tags2 = ["b", "d", "t", "v", "b"];

      const allTags = [...new Set([...tags1, ...tags2])].sort();

      gamesService.addGame({ name: "random name1", tags: tags1 });
      gamesService.addGame({ name: "random name2", tags: tags2 });

      expect(gamesService.getAllGameTags().sort()).to.deep.equal(allTags);
    });
  });
});
