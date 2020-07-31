/** @jsx jsx */
import { jsx } from "@emotion/core";
import { MUIDatatableRenderer } from "../../typings/muiDatatable";
import { Checkbox } from "@material-ui/core";
import { ErrorSnackbarEnqueuer } from "../hooks/useErrorSnackbar";
import { SuccessSnackbarEnqueuer } from "../hooks/useSuccessSnackbar";

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
  const MUIDatatableIsSuspendedRenderer: MUIDatatableRenderer<boolean> = (
    value,
    tableMeta,
    updateValue
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
