/** @jsx jsx */
import { jsx } from "@emotion/core";
import ReactDOM from "react-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@material-ui/core";
import { ThemeProvider, useTheme } from "@material-ui/core/styles";
import { ReactNode } from "react";

interface Options {
  content: ReactNode | string;
  title: ReactNode | string;
}

export const useConfirmDialog = () => {
  const muiTheme = useTheme();
  const dialogRoot = document.getElementById("dialog") as HTMLDivElement;

  const confirm = ({ content, title }: Options): Promise<boolean> => {
    return new Promise((resolve) => {
      const DialogComponent = () => {
        const close = (returnValue: any) => {
          ReactDOM.unmountComponentAtNode(dialogRoot);
          resolve(returnValue);
        };

        return (
          <ThemeProvider theme={muiTheme}>
            <Dialog open>
              <DialogTitle>{title}</DialogTitle>
              <DialogContent>
                <DialogContentText component="span" variant="body1">
                  {content}
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => close(false)}>Cancel</Button>
                <Button onClick={() => close(true)}>OK</Button>
              </DialogActions>
            </Dialog>
          </ThemeProvider>
        );
      };

      ReactDOM.render(<DialogComponent />, dialogRoot);
    });
  };

  return { confirm };
};
