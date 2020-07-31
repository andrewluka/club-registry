/** @jsx jsx */
import { jsx } from "@emotion/core";
import { MUIDatatableRenderer } from "../../typings/muiDatatable";
import { Tooltip, IconButton, Modal } from "@material-ui/core";
import { QRCodeIcon } from "./QRCodeIcon";
import QRCode from "qrcode.react";
import {
  useDismissableSnackbar,
  DismissableSnackbarEnqueuer,
} from "../hooks/useDismissableSnackbar";

interface Options {
  qrCodeValueIndex?: number;
  enqueueDismissableSnackbar: DismissableSnackbarEnqueuer;
}

export const getMUIDatatableQRCodeRenderer = ({
  enqueueDismissableSnackbar,
  qrCodeValueIndex = 0,
}: Options) => {
  const MUIDatatableQRCodeRenderer: MUIDatatableRenderer<boolean> = (
    isModalOpen,
    tableMeta,
    setIsModalOpen
  ) => {
    isModalOpen = typeof isModalOpen === "boolean" ? isModalOpen : false;
    const value = tableMeta.rowData[qrCodeValueIndex];

    const openModal = () => setIsModalOpen(true as any);
    const closeModal = () => setIsModalOpen(false as any);

    const units = window.innerHeight > window.innerWidth ? "vw" : "vh";
    const modalSize = 100 + units;
    const iconSize =
      0.9 * (units === "vw" ? window.innerWidth : window.innerHeight);

    return isModalOpen ? (
      <Modal open={isModalOpen} onClose={closeModal}>
        <div
          css={{
            width: modalSize,
            height: modalSize,
            position: "fixed",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
          }}
        >
          <QRCode
            onClick={(event) => {
              console.log(
                new XMLSerializer().serializeToString(
                  (event.nativeEvent.target as HTMLElement).parentNode as any
                )
              );
              enqueueDismissableSnackbar({
                message: "Hullo",
              });
            }}
            css={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
            width={iconSize}
            height={iconSize}
            renderAs="svg"
            value={String(value)}
          />
        </div>
      </Modal>
    ) : (
      <Tooltip title="Generate QR Code">
        <IconButton onClick={openModal}>
          <QRCodeIcon />
        </IconButton>
      </Tooltip>
    );
  };

  return MUIDatatableQRCodeRenderer;
};
