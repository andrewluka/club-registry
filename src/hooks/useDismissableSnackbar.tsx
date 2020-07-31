// useDismissableSnackbar
import React from "react";
import { useSnackbar, OptionsObject } from "notistack";
import { SnackbarContent } from "../components/SnackbarContent";

interface Options {
  originalSnackbarOptions?: OptionsObject;
  message: string;
}

export type DismissableSnackbarEnqueuer = (options: Options) => void;

export const useDismissableSnackbar = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const enqueueDismissableSnackbar: DismissableSnackbarEnqueuer = (
    options: Options
  ) => {
    const key = enqueueSnackbar(
      <SnackbarContent onCloseButtonClicked={() => closeSnackbar(key)}>
        {options.message}
      </SnackbarContent>,
      options.originalSnackbarOptions || {}
    );
  };

  return { enqueueDismissableSnackbar };
};
