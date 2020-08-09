import { Database } from "better-sqlite3";
import TablesService from "./TablesService";

export default class StatisticsService {
  constructor(private db: Database) {
    const tablesService = new TablesService(this.db);
    tablesService.createTables();
  }
}
