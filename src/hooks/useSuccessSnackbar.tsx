import { OptionsObject } from "notistack";
import { useDismissableSnackbar } from "./useDismissableSnackbar";

interface Options {
  originalSnackbarOptions?: OptionsObject;
  successMessage?: string;
}

export type SuccessSnackbarEnqueuer = (options?: Options) => void;

export const useSuccessSnackbar = () => {
  const { enqueueDismissableSnackbar } = useDismissableSnackbar();

  const enqueueSuccessSnackbar: SuccessSnackbarEnqueuer = (options?: Options) =>
    enqueueDismissableSnackbar({
      message: options?.successMessage || "Done!",
      originalSnackbarOptions: {
        ...(options?.originalSnackbarOptions || {}),
        variant: "success",
      },
    });

  return { enqueueSuccessSnackbar };
};
