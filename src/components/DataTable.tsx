import React from "react";
import MUIDataTable, {
  MUIDataTableColumnDef,
  debounceSearchRender,
} from "mui-datatables";
import { useErrorSnackbar } from "../hooks/useErrorSnackbar";
import { useSuccessSnackbar } from "../hooks/useSuccessSnackbar";

interface BaseProps<Row> {
  rows: Row[];
  columns: MUIDataTableColumnDef[];
  title: string;
  customSearch?: (
    searchQuery: string,
    currentRow: any[],
    columns: any[]
  ) => boolean;
}

interface RemovalProps<Row> extends BaseProps<Row> {
  getRowId: (row: Row) => number;
  remove: (id: number) => boolean;
}

type Props<Row> = BaseProps<Row> | RemovalProps<Row>;

export type DataTableColumnDef = MUIDataTableColumnDef;

export const DataTable = <Row extends object | number[] | string[]>(
  props: Props<Row>
) => {
  const { rows, columns, title, customSearch } = props;
  const { getRowId, remove } = props as RemovalProps<Row>;

  const isRemovingAllowed = !!(getRowId && remove);

  const { enqueueErrorSnackbar } = useErrorSnackbar();
  const { enqueueSuccessSnackbar } = useSuccessSnackbar();

  return (
    <MUIDataTable
      options={{
        rowsPerPage: 5,
        rowsPerPageOptions: [5, 10, 20],
        selectableRows: isRemovingAllowed ? "single" : "none",
        onRowsDelete: isRemovingAllowed
          ? ({ data: rowsToDelete }) => {
              const id = getRowId(rows[rowsToDelete[0].dataIndex]);
              const isDeleteSuccessful = remove(id);

              if (!isDeleteSuccessful) {
                enqueueErrorSnackbar();
                return false;
              } else {
                enqueueSuccessSnackbar();
              }
            }
          : undefined,
        customSearchRender: debounceSearchRender(200),
        ...(customSearch ? { customSearch } : {}),
        print: false,
      }}
      title={title}
      columns={columns}
      data={rows}
    />
  );
};
