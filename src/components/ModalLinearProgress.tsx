/** @jsx jsx */
import { jsx } from "@emotion/core";
import { Modal, LinearProgress, LinearProgressProps } from "@material-ui/core";
import { FC } from "react";

interface Props extends LinearProgressProps {
  open: boolean;
}

export const ModalLinearProgress: FC<Props> = (props) => {
  return (
    <Modal open={props.open}>
      <LinearProgress
        color="primary"
        variant="indeterminate"
        css={{
          outline: 0,
          width: "80vw",
          position: "fixed",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
        {...props}
      />
    </Modal>
  );
};
