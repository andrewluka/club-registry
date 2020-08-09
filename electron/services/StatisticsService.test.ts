import GamesService from "./GamesService";
import Database from "better-sqlite3";
import UsersService from "./UsersService";
import StatisticsService, {
  UserStatistics,
  GameStatistics,
  CountingRecord,
} from "./StatisticsService";
import { GAMES_TAGS_DELIMITER } from "../../src/constants/tables";

test("StatisticsService#getAllBorrowings", () => {
  const db = Database(":memory:");
  const gamesService = new GamesService(db);
  const usersService = new UsersService(db);
  const statisticsService = new StatisticsService(db);

  const expectedNumOfBorrowings = 9;

  for (let i = 0; i < expectedNumOfBorrowings; ++i) {
    const game = gamesService.addGame({ name: `game${i}` });
    const borrower = usersService.addUser({ name: `user${i}` });

    gamesService.borrowGame({ borrower, game });
    if (Math.random() > 0.5) gamesService.returnGame({ borrower, game });
  }

  const borrowings = statisticsService.getAllBorrowings().length;
  expect(borrowings).toBe(expectedNumOfBorrowings);
});

test("StatisticsService#getUserStatistics", () => {
  interface ExpectedUserStatistics
    extends Omit<UserStatistics, "allBorrowings"> {
    borrowingsCount: number;
  }

  const db = Database(":memory:");
  const gamesService = new GamesService(db);
  const usersService = new UsersService(db);
  const statisticsService = new StatisticsService(db);

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

  expect(statistics.allBorrowings.length).toBe(expected.borrowingsCount);
  expect(statistics.gamesBorrowingsCount).toStrictEqual(
    expected.gamesBorrowingsCount
  );
  expect(statistics.tagsBorrowedCount).toStrictEqual(
    expected.tagsBorrowedCount
  );
});

test("StatisticsService#getGameStatistics", () => {
  interface ExpectedGameStatistics {
    allBorrowingsCount: number;
    borrowersCount: CountingRecord<number>;
  }

  const db = Database(":memory:");
  const gamesService = new GamesService(db);
  const usersService = new UsersService(db);
  const statisticsService = new StatisticsService(db);

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

  expect(statistics.allBorrowings.length).toBe(expected.allBorrowingsCount);
  expect(statistics.borrowersCount).toEqual(statistics.borrowersCount);
});

test("StatisticsService#getTagsCount", () => {
  const db = Database(":memory:");
  const gamesService = new GamesService(db);
  const usersService = new UsersService(db);
  const statisticsService = new StatisticsService(db);

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
    expect(statistics).toStrictEqual(expectedTagsCount);
  }
});
