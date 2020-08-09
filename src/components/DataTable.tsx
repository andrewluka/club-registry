import React from "react";
import MUIDataTable, {
  MUIDataTableColumnDef,
  debounceSearchRender,
} from "mui-datatables";
import { useErrorSnackbar } from "../hooks/useErrorSnackbar";
import { useSuccessSnackbar } from "../hooks/useSuccessSnackbar";

interface BaseProps<T> {
  rows: T[];
  columns: MUIDataTableColumnDef[];
  title: string;
}

interface RemovalProps<T> extends BaseProps<T> {
  getRowId: (row: T) => number;
  remove: (id: number) => boolean;
}

type Props<T> = BaseProps<T> | RemovalProps<T>;

export type DataTableColumnDef = MUIDataTableColumnDef;

export const DataTable = <T extends object | number[] | string[]>(
  props: Props<T>
) => {
  const { rows, columns, title } = props;
  const { getRowId, remove } = props as RemovalProps<T>;

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
              console.log({ rowsToDelete, rows });
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
        customSearchRender: debounceSearchRender(500),
        print: false,
      }}
      title={title}
      columns={columns}
      data={rows}
    />
  );
};
