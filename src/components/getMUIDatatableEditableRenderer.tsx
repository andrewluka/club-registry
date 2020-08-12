/** @jsx jsx */
import { jsx } from "@emotion/core";
import { TextField } from "@material-ui/core";
import { MUIDatatableRenderer } from "../typings/muiDatatable";
import { useErrorSnackbar } from "../hooks/useErrorSnackbar";
import { useSuccessSnackbar } from "../hooks/useSuccessSnackbar";
import { useState, ChangeEvent } from "react";
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
  const MUIDatatableEditableRenderer: MUIDatatableRenderer<string> = (
    value,
    tableMeta,
    updateValue
  ) => {
    const id = tableMeta.rowData[idIndex];

    const InputComponent = () => {
      const [isError, setError] = useState(false);
      const [formValue, setFormValue] = useState(value || "");

      const { enqueueErrorSnackbar } = useErrorSnackbar();
      const { enqueueSuccessSnackbar } = useSuccessSnackbar();

      const onChange = (
        event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
      ) => {
        const newValue = event.target.value;
        if (validateInput(newValue)) {
          setFormValue(newValue);
          setError(false);
        } else {
          setError(true);
        }
      };

      return (
        <TextField
          error={isError}
          value={formValue}
          onChange={onChange}
          onBlur={(event) => {
            const newValue = event.target.value;

            if (newValue === get(id)) return;

            if (validateInput(newValue)) {
              setFormValue(newValue);
              setError(false);

              // updateValue(newValue);
              const wasOperationSuccessful = update({
                id,
                newValue,
              });

              wasOperationSuccessful
                ? enqueueSuccessSnackbar({ successMessage: "Field updated" })
                : enqueueErrorSnackbar({
                    errorMessage: "Couldn't update field",
                  });
            } else {
              setError(true);
            }
          }}
          color="primary"
        />
      );
    };

    return <InputComponent />;
  };
  return MUIDatatableEditableRenderer;
};
