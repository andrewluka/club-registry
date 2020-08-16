import { expect } from "chai";
import GamesService from "./GamesService";
import Database from "better-sqlite3";
import UsersService from "./UsersService";
import StatisticsService from "./StatisticsService";
import { UserStatistics, CountingRecord } from "../../src/typings/statistics";

import { GAMES_TAGS_DELIMITER } from "../../src/constants/tables";
import AttendanceService from "./AttendanceService";

describe("StatisticsService", function () {
  describe("#getAllBorrowings", function () {
    it("should get all borrowings' data", function () {
      const db = Database(":memory:");
      const gamesService = new GamesService(db);
      const usersService = new UsersService(db);
      const statisticsService = new StatisticsService(db);
      const attendanceService = new AttendanceService(db);

      attendanceService.startSession();

      const expectedNumOfBorrowings = 9;

      for (let i = 0; i < expectedNumOfBorrowings; ++i) {
        const game = gamesService.addGame({ name: `game${i}` });
        const borrower = usersService.addUser({ name: `user${i}` });

        gamesService.borrowGame({ borrower, game });
        if (Math.random() > 0.5) gamesService.returnGame({ borrower, game });
      }

      const borrowings = statisticsService.getAllBorrowings().length;
      expect(borrowings).to.equal(expectedNumOfBorrowings);
    });
  });

  describe("#getUserStatistics", function () {
    it("should get correct user statistics", function () {
      interface ExpectedUserStatistics
        extends Omit<UserStatistics, "allBorrowings"> {
        borrowingsCount: number;
      }

      const db = Database(":memory:");
      const gamesService = new GamesService(db);
      const usersService = new UsersService(db);
      const statisticsService = new StatisticsService(db);
      const attendanceService = new AttendanceService(db);

      attendanceService.startSession();

      const tags = "abcdef".split("");

      const borrower = usersService.addUser({ name: "user" });

      const expected: ExpectedUserStatistics = {
        borrowingsCount: 0,
        gamesBorrowingsCount: {},
        tagsBorrowedCount: {},
      };

      for (let i = 0; i < 9; ++i) {
        const game = gamesService.addGame({
          name: `game${i}`,
          tags: tags.filter(() => Math.random() > 0.5),
        });

        const actualGameTags =
          gamesService.getGame(game)?.tags?.split(GAMES_TAGS_DELIMITER) || [];

        expected.borrowingsCount++;

        expected.gamesBorrowingsCount[game] = 1;

        actualGameTags.forEach((tag) =>
          expected.tagsBorrowedCount[tag]
            ? expected.tagsBorrowedCount[tag]++
            : (expected.tagsBorrowedCount[tag] = 1)
        );

        gamesService.borrowGame({ borrower, game });
        gamesService.returnGame({ borrower, game });
      }

      const statistics = statisticsService.getUserStatistics(borrower);

      expect(statistics.allBorrowings.length).to.equal(
        expected.borrowingsCount
      );
      expect(statistics.gamesBorrowingsCount).to.deep.equal(
        expected.gamesBorrowingsCount
      );
      expect(statistics.tagsBorrowedCount).to.deep.equal(
        expected.tagsBorrowedCount
      );
    });

    it("should throw if user does not exist", function () {
      const db = Database(":memory:");
      const statisticsService = new StatisticsService(db);

      let e: any;

      try {
        statisticsService.getUserStatistics(864);
      } catch (e_) {
        e = e_;
      }

      expect(Boolean(e)).to.be.true;
    });
  });

  describe("#getGameStatistics", function () {
    it("should get correct game statistics", function () {
      interface ExpectedGameStatistics {
        allBorrowingsCount: number;
        borrowersCount: CountingRecord<number>;
      }

      const db = Database(":memory:");
      const gamesService = new GamesService(db);
      const usersService = new UsersService(db);
      const statisticsService = new StatisticsService(db);
      const attendanceService = new AttendanceService(db);

      attendanceService.startSession();

      const game = gamesService.addGame({ name: "name" });

      const expected: ExpectedGameStatistics = {
        allBorrowingsCount: 0,
        borrowersCount: {},
      };

      for (let i = 0; i < 8; ++i) {
        const borrower = usersService.addUser({ name: `user ${i}` });
        gamesService.borrowGame({ borrower, game });
        gamesService.returnGame({ borrower, game });
        expected.allBorrowingsCount++;
        expected.borrowersCount[borrower]
          ? expected.borrowersCount[borrower]++
          : (expected.borrowersCount[borrower] = 1);
      }

      const statistics = statisticsService.getGameStatistics(game);

      expect(statistics.allBorrowings.length).to.equal(
        expected.allBorrowingsCount
      );
      expect(statistics.borrowersCount).to.deep.equal(
        statistics.borrowersCount
      );
    });

    it("should throw if game does not exist", function () {
      const db = Database(":memory:");
      const statisticsService = new StatisticsService(db);

      let e: any;

      try {
        statisticsService.getGameStatistics(864);
      } catch (e_) {
        e = e_;
      }

      expect(Boolean(e)).to.be.true;
    });
  });

  describe("#getTagsCount", function () {
    it("should correctly count tags", function () {
      const db = Database(":memory:");
      const gamesService = new GamesService(db);
      const usersService = new UsersService(db);
      const statisticsService = new StatisticsService(db);
      const attendanceService = new AttendanceService(db);

      attendanceService.startSession();

      const tags = "abcdefg".split("");

      const expectedTagsCount: CountingRecord<string> = {};

      for (let i = 0; i < 8; ++i) {
        const game_id = gamesService.addGame({
          name: `game${i}`,
          tags: tags.filter(() => Math.random() > 0.5),
        });

        const borrower = usersService.addUser({ name: `user ${i}` });
        gamesService.borrowGame({ borrower, game: game_id });
        gamesService.returnGame({ borrower, game: game_id });

        const game = gamesService.getGame(game_id);
        const gameTags = game?.tags?.split(GAMES_TAGS_DELIMITER) || [];

        for (let i = 0; i < gameTags.length; i++) {
          const tag = gameTags[i];
          expectedTagsCount[tag]
            ? expectedTagsCount[tag]++
            : (expectedTagsCount[tag] = 1);
        }

        const statistics = statisticsService.getTagsCount();
        expect(statistics).to.deep.equal(expectedTagsCount);
      }
    });
  });
});
