/** @jsx jsx */
import { jsx } from "@emotion/core";
import { TextField } from "@material-ui/core";
import { MUIDatatableRenderer } from "../typings/muiDatatable";
import { useErrorSnackbar } from "../hooks/useErrorSnackbar";
import { useSuccessSnackbar } from "../hooks/useSuccessSnackbar";
import { useState, ChangeEvent } from "react";
import { MUIDataTableMeta } from "mui-datatables";
import { ErrorWrapper } from "../typings/tables";

interface Options {
  validateInput?: (newValue: string) => boolean;
  update: (options: { id: number; newValue: string }) => ErrorWrapper<void>;
  get: (id: number) => ErrorWrapper<string>;
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

            const { isError, payload } = get(id);

            if (isError)
              return enqueueErrorSnackbar({
                errorMessage: (payload as any)?.message || String(payload),
              });

            if (newValue === payload) return;

            if (validateInput(newValue)) {
              setFormValue(newValue);
              setError(false);

              // updateValue(newValue);
              const { isError, payload } = update({
                id,
                newValue,
              });

              isError
                ? enqueueSuccessSnackbar({ successMessage: "Field updated" })
                : enqueueErrorSnackbar({
                    errorMessage:
                      "Couldn't update field: " + (payload as any)?.message ||
                      String(payload),
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
