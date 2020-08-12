/** @jsx jsx */
import { jsx } from "@emotion/core";
import { MUIDatatableRenderer } from "../typings/muiDatatable";
import { Checkbox } from "@material-ui/core";
import { MUIDataTableMeta } from "mui-datatables";
import { useErrorSnackbar } from "../hooks/useErrorSnackbar";
import { useState } from "react";

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
  const MUIDatatableIsSuspendedRenderer: MUIDatatableRenderer<boolean> = (
    value,
    tableMeta
  ) => {
    const CheckboxComponent = <T extends any>({
      tableMeta,
      value,
    }: {
      value: T;
      tableMeta: MUIDataTableMeta;
    }) => {
      const [isChecked, setIsChecked] = useState(!!value);
      const { enqueueErrorSnackbar } = useErrorSnackbar();

      return (
        <Checkbox
          color="secondary"
          checked={!!isChecked}
          onChange={(event) => {
            const isChecked = event.target.checked;
            const id = tableMeta.rowData[idIndex];
            const operationDidSucceed = isChecked ? suspend(id) : unsuspend(id);

            if (operationDidSucceed) {
              setIsChecked(isChecked);
            } else {
              enqueueErrorSnackbar({
                errorMessage: isChecked
                  ? "Couldn't do that; check borrowed games and users"
                  : "Couldn't do that",
              });
            }
          }}
        />
      );
    };

    return <CheckboxComponent value={value} tableMeta={tableMeta} />;
  };

  return MUIDatatableIsSuspendedRenderer;
};
