/** @jsx jsx */
import { jsx } from "@emotion/core";
import { InputBase } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import { MUIDatatableRenderer } from "../../typings/muiDatatable";
import { Theme } from "../../typings/theme";
import { defaultLightTheme } from "../themes/defaultLightTheme";
import { ErrorSnackbarEnqueuer } from "../hooks/useErrorSnackbar";
import { SuccessSnackbarEnqueuer } from "../hooks/useSuccessSnackbar";

interface Options {
  theme?: Theme;
  validateInput: (newValue: string) => boolean;
  update: (options: { id: number; newValue: string }) => boolean;
  get: (id: number) => string;
  enqueueErrorSnackbar: ErrorSnackbarEnqueuer;
  enqueueSuccessSnackbar: SuccessSnackbarEnqueuer;
  idIndex?: number;
}

export const getMUIDatatableEditableRenderer = function ({
  validateInput,
  theme = defaultLightTheme,
  idIndex = 0,
  enqueueErrorSnackbar,
  enqueueSuccessSnackbar,
  update,
  get,
}: Options) {
  const { primaryColor, primaryTextColor } = theme;

  const Input = withStyles({
    root: {
      "& input": {
        marginLeft: 2,
      },
      opacity: 0.7,
      borderStyle: "solid",
      borderColor: primaryColor,
      borderWidth: 2,
      borderRadius: 3,
      color: primaryTextColor,
    },
    focused: {
      opacity: 1,
    },
  })(InputBase);

  const MUIDatatableEditableRenderer: MUIDatatableRenderer<string> = (
    value,
    tableMeta,
    updateValue
  ) => {
    return (
      <Input
        type="text"
        value={value}
        onChange={(event) => {
          const newValue = event.target.value;

          if (!validateInput(newValue)) {
            enqueueErrorSnackbar({ errorMessage: "Invalid input" });
            return;
          }

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

  return MUIDatatableEditableRenderer;
};
