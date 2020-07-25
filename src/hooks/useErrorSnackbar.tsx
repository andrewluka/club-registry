import React, { ReactNode } from "react";
import { useSnackbar, OptionsObject } from "notistack";
import { ErrorSnackbarContent } from "../components/ErrorSnackbarContent";

export interface Options extends OptionsObject {
  errorMessage: string;
}

export type ErrorSnackbarEnqueuer = (options?: Options) => void;

export const useErrorSnackbar = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const enqueueErrorSnackbar: ErrorSnackbarEnqueuer = (options?: Options) => {
    const key = enqueueSnackbar(
      <ErrorSnackbarContent onCloseButtonClicked={() => closeSnackbar(key)}>
        {options?.errorMessage}
      </ErrorSnackbarContent>,
      { ...(options || {}), variant: "error" }
    );
  };

  return { enqueueErrorSnackbar };
};
