/** @jsx jsx */
import { jsx } from "@emotion/core";
import { FC, forwardRef } from "react";
import { Modal, ModalProps } from "@material-ui/core";

interface Props extends ModalProps {
  width?: number | string;
  height?: number | string;
}

export const CenteredModal: FC<Props> = forwardRef((props, ref) => {
  const units = window.innerHeight > window.innerWidth ? "vw" : "vh";
  const modalSize = 100 + units;

  const {
    children,
    height = modalSize,
    width = modalSize,
    ...modalProps
  } = props;

  return (
    <Modal {...modalProps} ref={ref}>
      <div
        css={{
          width,
          height,
          position: "fixed",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "white",
          outline: 0,
        }}
      >
        {children}
      </div>
    </Modal>
  );
});
