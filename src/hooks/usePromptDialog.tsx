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
  TextField,
} from "@material-ui/core";
import { ThemeProvider, useTheme } from "@material-ui/core/styles";
import { ReactNode, useState, ComponentType } from "react";

interface InputProps<InputType> {
  value: InputType | undefined;
  onChange: (newValue: InputType) => void;
}

type InputComponentProps<InputType> = ComponentType<InputProps<InputType>>;

interface Options<InputType> {
  content: ReactNode | string;
  title: ReactNode | string;
  InputComponent?: ComponentType<InputProps<InputType>>;
}

const DefaultInputComponent: InputComponentProps<string> = ({
  value,
  onChange,
}) => (
  <TextField value={value} onChange={(event) => onChange(event.target.value)} />
);

export const usePromptDialog = () => {
  const muiTheme = useTheme();
  const dialogRoot = document.getElementById("dialog") as HTMLDivElement;

  const prompt = <InputType extends any>({
    content,
    title,
    InputComponent = DefaultInputComponent as any,
  }: Options<InputType>): Promise<InputType | undefined> => {
    return new Promise((resolve) => {
      const DialogComponent = () => {
        const [value, setValue] = useState<InputType>();
        const [shouldSetState, setShouldSetState] = useState(true);

        const close = (returnValue: any) => {
          setShouldSetState(false);
          setTimeout(() => ReactDOM.unmountComponentAtNode(dialogRoot), 100);
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
                <InputComponent
                  value={value}
                  onChange={(newValue) => shouldSetState && setValue(newValue)}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => close(undefined)}>Cancel</Button>
                <Button onClick={() => close(value ? value : undefined)}>
                  OK
                </Button>
              </DialogActions>
            </Dialog>
          </ThemeProvider>
        );
      };

      ReactDOM.render(<DialogComponent />, dialogRoot);
    });
  };

  return { prompt };
};
