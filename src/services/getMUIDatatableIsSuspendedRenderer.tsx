/** @jsx jsx */
import { jsx } from "@emotion/core";
import { MUIDataTableMeta } from "mui-datatables";
import { Checkbox } from "@material-ui/core";
import { ErrorSnackbarEnqueuer } from "../hooks/useErrorSnackbar";

interface Options {
  unsuspend: (id: number) => boolean;
  suspend: (id: number) => boolean;
  idIndex?: number;
  enqueueErrorSnackbar: ErrorSnackbarEnqueuer;
}

export const getMUIDatatableIsSuspendedRenderer = ({
  unsuspend,
  suspend,
  enqueueErrorSnackbar,
  idIndex = 0,
}: Options) => {
  const MUIDatatableIsSuspendedRenderer = (
    value: boolean,
    tableMeta: MUIDataTableMeta,
    updateValue: (value: string) => void
  ) => {
    return (
      <Checkbox
        color="secondary"
        checked={!!value}
        onChange={() => {
          const id = tableMeta.rowData[idIndex];
          const operationDidSucceed = value ? unsuspend(id) : suspend(id);

          if (operationDidSucceed) {
            updateValue(!value as any);
          } else {
            enqueueErrorSnackbar();
          }
        }}
      />
    );
  };

  return MUIDatatableIsSuspendedRenderer;
};
