/** @jsx jsx */
import { jsx } from "@emotion/core";
import { TextField } from "@material-ui/core";
import { MUIDatatableRenderer } from "../typings/muiDatatable";
import { useErrorSnackbar } from "../hooks/useErrorSnackbar";
import { useSuccessSnackbar } from "../hooks/useSuccessSnackbar";
import { useState } from "react";
import { MUIDataTableMeta } from "mui-datatables";

interface Options {
  validateInput?: (newValue: string) => boolean;
  update: (options: { id: number; newValue: string }) => boolean;
  get: (id: number) => string;
  idIndex?: number;
}

export const getMUIDatatableEditableRenderer = function ({
  validateInput = (input) => !!input.trim(),
  idIndex = 0,
  update,
  get,
}: Options) {
  interface Props<T> {
    value: T;
    tableMeta: MUIDataTableMeta;
    updateValue: (value: string) => void;
  }

  // const theme = useTheme<Theme>();

  // const { primaryColor, primaryTextColor } = theme;

  const InputComponent = <T extends any>({
    value,
    tableMeta,
    updateValue,
  }: Props<T>) => {
    const [isError, setIsError] = useState(false);
    const { enqueueErrorSnackbar } = useErrorSnackbar();
    const { enqueueSuccessSnackbar } = useSuccessSnackbar();

    return (
      <TextField
        color="primary"
        // classes={classes}
        error={isError}
        type="text"
        value={value}
        onChange={(event) => {
          const newValue = event.target.value;

          if (!validateInput(newValue)) {
            setIsError(true);
            return;
          }

          setIsError(false);
          updateValue(newValue);
        }}
        onBlur={(event) => {
          const newValue = event.target.value;
          const id = tableMeta.rowData[idIndex];

          if (newValue === get(id)) return;

          const wasOperationSuccessful = update({ id, newValue });

          if (!wasOperationSuccessful) {
            enqueueErrorSnackbar({ errorMessage: "Couldn't change that" });
          } else {
            enqueueSuccessSnackbar();
          }
        }}
      />
    );
  };

  const MUIDatatableEditableRenderer: MUIDatatableRenderer<string> = (
    value,
    tableMeta,
    updateValue
  ) => {
    return (
      <InputComponent
        value={value}
        tableMeta={tableMeta}
        updateValue={updateValue}
      />
    );
  };

  return MUIDatatableEditableRenderer;
};
