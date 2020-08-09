import { OptionsObject } from "notistack";
import { useDismissableSnackbar } from "./useDismissableSnackbar";

interface Options {
  originalSnackbarOptions?: OptionsObject;
  errorMessage?: string;
}

export type ErrorSnackbarEnqueuer = (options?: Options) => void;

export const useErrorSnackbar = () => {
  const { enqueueDismissableSnackbar } = useDismissableSnackbar();

  const enqueueErrorSnackbar: ErrorSnackbarEnqueuer = (options?: Options) =>
    enqueueDismissableSnackbar({
      message: options?.errorMessage || "Can't do that",
      originalSnackbarOptions: {
        ...(options?.originalSnackbarOptions || {}),
        variant: "error",
      },
    });

  return { enqueueErrorSnackbar };
};
