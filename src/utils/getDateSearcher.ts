import moment from "moment";
import { SPELLED_OUT_DATE_AND_TIME_FORMAT } from "../constants/dates";
import { isNotNullOrUndefined } from "./isNotNullOrUndefined";

type Searcher = (searchQuery: string, row: any[], columns: any[]) => boolean;

interface Options {
  namesOfColumnsWithDates: string[];
}

export const getDateSearcher = ({
  namesOfColumnsWithDates,
}: Options): Searcher => (searchQuery, rawRow, columns) => {
  const row = [...rawRow];

  for (const columnName of namesOfColumnsWithDates) {
    const index = columns.findIndex(({ name }) => name === columnName);
    row[index] = moment(row[index]).format(SPELLED_OUT_DATE_AND_TIME_FORMAT);
  }

  searchQuery = searchQuery.toLowerCase();

  const rowString = row
    .filter(isNotNullOrUndefined)
    .join("")
    .toLowerCase()
    .trim();

  return rowString.includes(searchQuery.trim());
};
