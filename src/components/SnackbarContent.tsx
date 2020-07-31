/** @jsx jsx */
import { jsx } from "@emotion/core";
import { FC } from "react";
import { IconButton } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";

interface Props {
  onCloseButtonClicked?: () => void;
}

export const SnackbarContent: FC<Props> = ({
  onCloseButtonClicked,
  children,
}) => {
  return (
    <div
      css={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: 400,
        maxHeight: 30,
      }}
    >
      {children}
      {onCloseButtonClicked && (
        <IconButton onClick={() => onCloseButtonClicked()}>
          <CloseIcon css={{ fill: "white" }} />
        </IconButton>
      )}
    </div>
  );
};
