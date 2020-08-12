import { MUIDataTableColumnOptions } from "mui-datatables";

const isSuspendedFilterListRenderer = (value: any) =>
  value ? "Suspended" : "Not Suspended";

export const getDataTableIsSuspendedOptions = (): MUIDataTableColumnOptions => ({
  customFilterListOptions: {
    render: isSuspendedFilterListRenderer,
  },
  filterOptions: {
    renderValue: isSuspendedFilterListRenderer,
  },
});
