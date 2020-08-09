/** @jsx jsx */
import { jsx } from "@emotion/core";
import { Fragment } from "react";
import { MUIDatatableRenderer } from "../typings/muiDatatable";
import { Tooltip, IconButton } from "@material-ui/core";
import { QRCodeIcon } from "./QRCodeIcon";
import { QRCodeModal } from "./QRCodeModal";

interface Options {
  qrCodeValueIndex?: number;
}

export const getMUIDatatableQRCodeRenderer = (options?: Options) => {
  const { qrCodeValueIndex = 0 } = options || {};

  const MUIDatatableQRCodeRenderer: MUIDatatableRenderer<boolean> = (
    isModalOpen,
    tableMeta,
    setIsModalOpen
  ) => {
    isModalOpen = typeof isModalOpen === "boolean" ? isModalOpen : false;
    const value = tableMeta.rowData[qrCodeValueIndex];

    const openModal = () => setIsModalOpen(true as any);
    const closeModal = () => setIsModalOpen(false as any);

    return (
      <Fragment>
        {isModalOpen && (
          <QRCodeModal
            onClose={closeModal}
            open={isModalOpen}
            qrCodeValue={String(value)}
          />
        )}
        <Tooltip title="Generate QR Code">
          <IconButton onClick={openModal}>
            <QRCodeIcon />
          </IconButton>
        </Tooltip>
      </Fragment>
    );
  };

  return MUIDatatableQRCodeRenderer;
};
