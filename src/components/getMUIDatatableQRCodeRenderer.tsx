/** @jsx jsx */
import { jsx } from "@emotion/core";
import { Fragment, useState } from "react";
import {
  MUIDatatableRenderer,
  MUIDatatableRendererArgsAsProps,
} from "../typings/muiDatatable";
import { Tooltip, IconButton } from "@material-ui/core";
import { QRCodeIcon } from "./QRCodeIcon";
import { DownloadQRCodeDialog } from "./DownloadQRCodeDialog";

interface Options {
  qrCodeValueIndex?: number;
}

export const getMUIDatatableQRCodeRenderer = (options?: Options) => {
  const { qrCodeValueIndex = 0 } = options || {};

  const QRCodeModalComponent = ({
    value,
    tableMeta,
  }: MUIDatatableRendererArgsAsProps<boolean>) => {
    const [isModalOpen, setIsModalOpen] = useState(
      typeof value === "boolean" ? value : false
    );
    const qrCodeValue = tableMeta.rowData[qrCodeValueIndex];

    const openModal = () => setIsModalOpen(true as any);
    const closeModal = () => setIsModalOpen(false as any);

    return (
      <Fragment>
        {isModalOpen && (
          <DownloadQRCodeDialog
            onClose={closeModal}
            open={isModalOpen}
            qrCodeValue={String(qrCodeValue)}
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

  const MUIDatatableQRCodeRenderer: MUIDatatableRenderer<boolean> = (
    value,
    tableMeta,
    updateValue
  ) => (
    <QRCodeModalComponent
      value={value}
      updateValue={updateValue}
      tableMeta={tableMeta}
    />
  );

  return MUIDatatableQRCodeRenderer;
};
