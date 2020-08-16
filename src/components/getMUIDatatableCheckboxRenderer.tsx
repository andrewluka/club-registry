/** @jsx jsx */
import { jsx } from "@emotion/core";
import { MUIDatatableRenderer } from "../typings/muiDatatable";
import { Checkbox } from "@material-ui/core";
import { MUIDataTableMeta } from "mui-datatables";
import { useErrorSnackbar } from "../hooks/useErrorSnackbar";
import { useState } from "react";
import { ErrorWrapper } from "../typings/tables";

interface Options {
  uncheck?: (id: number) => ErrorWrapper<void>;
  check?: (id: number) => ErrorWrapper<void>;
  idIndex?: number;
}

export const getMUIDatatableCheckboxRenderer = ({
  uncheck,
  check,
  idIndex = 0,
}: Options) => {
  const MUIDatatableCheckboxRenderer: MUIDatatableRenderer<boolean> = (
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
          disabled={
            (isChecked && !uncheck) ||
            (!isChecked && !check) ||
            (!check && !uncheck)
          }
          color="secondary"
          checked={!!isChecked}
          onChange={(event) => {
            const isChecked = event.target.checked;
            const id = tableMeta.rowData[idIndex];
            const { isError, payload } =
              (isChecked ? check?.(id) : uncheck?.(id)) || {};

            if (isError === undefined) return;

            if (!isError) {
              setIsChecked(isChecked);
            } else {
              enqueueErrorSnackbar({
                errorMessage:
                  (payload as any)?.message || String(payload) || "",
              });
            }
          }}
        />
      );
    };

    return <CheckboxComponent value={value} tableMeta={tableMeta} />;
  };

  return MUIDatatableCheckboxRenderer;
};
