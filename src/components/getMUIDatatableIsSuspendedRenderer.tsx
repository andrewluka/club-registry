/** @jsx jsx */
import { jsx } from "@emotion/core";
import { MUIDatatableRenderer } from "../typings/muiDatatable";
import { Checkbox } from "@material-ui/core";
import { MUIDataTableMeta } from "mui-datatables";
import { useErrorSnackbar } from "../hooks/useErrorSnackbar";

interface Options {
  unsuspend: (id: number) => boolean;
  suspend: (id: number) => boolean;
  idIndex?: number;
}

export const getMUIDatatableIsSuspendedRenderer = ({
  unsuspend,
  suspend,
  idIndex = 0,
}: Options) => {
  const CheckboxComponent = <T extends any>({
    tableMeta,
    updateValue,
    value,
  }: {
    value: T;
    tableMeta: MUIDataTableMeta;
    updateValue: (value: string) => void;
  }) => {
    const { enqueueErrorSnackbar } = useErrorSnackbar();
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

  const MUIDatatableIsSuspendedRenderer: MUIDatatableRenderer<boolean> = (
    value,
    tableMeta,
    updateValue
  ) => {
    return (
      <CheckboxComponent
        value={value}
        tableMeta={tableMeta}
        updateValue={updateValue}
      />
    );
  };

  return MUIDatatableIsSuspendedRenderer;
};
