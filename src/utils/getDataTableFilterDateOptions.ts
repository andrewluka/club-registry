import { MUIDataTableColumnOptions } from "mui-datatables";
import moment, { Moment } from "moment";
import {
  ORDINAL_DAYS_OF_THE_MONTH,
  HOURS_WITH_MERIDIAN,
  MONTH_FULL_NAMES,
  YEARS_IN_FULL,
  HOURS_12,
} from "../constants/dates";

interface Options<Row> {
  rows: Readonly<Row[]>;
  extractDate: (row: Row) => number | undefined | null;
  shouldShowHours?: boolean;
  shouldShowDays?: boolean;
  shouldShowMonths?: boolean;
  shouldShowYears?: boolean;
}

enum Token {
  DAY_TOKEN = "D",
  HOUR_TOKEN = "H",
  MONTH_TOKEN = "M",
  YEAR_TOKEN = "Y",
}

export const getDataTableDateFilterOptions = <Row>({
  extractDate,
  rows,
  shouldShowDays = false,
  shouldShowHours = false,
  shouldShowMonths = true,
  shouldShowYears = true,
}: Options<Row>): MUIDataTableColumnOptions => {
  const rawDates = rows.map(extractDate).filter(Boolean) as number[];

  const formatDate = (date: Moment, token: Token) => {
    switch (token) {
      case Token.DAY_TOKEN:
        return token + date.format(ORDINAL_DAYS_OF_THE_MONTH);

      case Token.HOUR_TOKEN:
        return token + date.format(HOURS_12);

      case Token.MONTH_TOKEN:
        return token + date.format(MONTH_FULL_NAMES);

      case Token.YEAR_TOKEN:
        return token + date.format(YEARS_IN_FULL);

      default:
        break;
    }
  };

  const allFilterOptions = rawDates
    .flatMap((rawDate) => {
      const date = moment(rawDate);
      const result = [];

      if (shouldShowDays) result.push(formatDate(date, Token.DAY_TOKEN));
      if (shouldShowHours) result.push(formatDate(date, Token.HOUR_TOKEN));
      if (shouldShowMonths) result.push(formatDate(date, Token.MONTH_TOKEN));
      if (shouldShowYears) result.push(formatDate(date, Token.YEAR_TOKEN));

      return result;
    })
    .filter(Boolean);

  const renderTokenedDate = (date: string): string => {
    const token = date[0] as Token;

    switch (token) {
      case Token.DAY_TOKEN:
        return `The ${date.substring(1)}`;
      case Token.HOUR_TOKEN:
        return date.substring(1);
      case Token.MONTH_TOKEN:
        return date.substring(1);
      case Token.YEAR_TOKEN:
        return `Year ${date.substring(1)}`;
      default:
        return "";
    }
  };

  return {
    filterOptions: {
      names: [...new Set(allFilterOptions)] as string[],
      renderValue: renderTokenedDate,
      logic: (prop, filterValues) => {
        const token = filterValues[0][0] as Token;
        const filterValue = filterValues[0].substring(1);

        if (typeof prop === "string") return !prop.includes(filterValue);
        if (typeof prop === "number")
          return !prop
            ? true
            : !formatDate(moment(prop), token)?.includes(filterValue);

        return true;
      },
    },
    customFilterListOptions: {
      render: renderTokenedDate,
    },
  };
};
