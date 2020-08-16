import { SPELLED_OUT_DATE_AND_TIME_FORMAT } from "../constants/dates";
import moment from "moment";
import { DataTableColumnDef } from "../components/DataTable";
import { getDataTableDateFilterOptions } from "./getDataTableFilterDateOptions";

interface Options<Row> {
  name?: string;
  rows: Row[];
  extractDate: (row: Row) => number | null | undefined;
}

export const getDateOfAdditionColumnDef = <Row>({
  name = "date_of_addition",
  rows,
  extractDate,
}: Options<Row>): DataTableColumnDef => ({
  name,
  label: "Date added",
  options: {
    customBodyRender: (date: number) =>
      moment(date).format(SPELLED_OUT_DATE_AND_TIME_FORMAT),
    ...getDataTableDateFilterOptions({
      extractDate,
      rows,
      shouldShowDays: true,
      shouldShowHours: true,
      shouldShowMonths: true,
      shouldShowYears: true,
    }),
  },
});
