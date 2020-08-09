/** @jsx jsx */
import { jsx } from "@emotion/core";
import { FC } from "react";
import { CenteredModal } from "./CenteredModal";
import QRCode from "qrcode.react";
import Electron from "electron";
import fs from "fs";
import { useErrorSnackbar } from "../hooks/useErrorSnackbar";
import { useSuccessSnackbar } from "../hooks/useSuccessSnackbar";
import { Tooltip } from "@material-ui/core";

const { writeFileSync } = window.require("fs") as typeof fs;
const electron: typeof Electron = window.require("electron");
const { dialog } = electron.remote;

interface Props {
  open: boolean;
  onClose: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void;
  qrCodeValue: string;
}

export const QRCodeModal: FC<Props> = ({ open, onClose, qrCodeValue }) => {
  const { enqueueErrorSnackbar } = useErrorSnackbar();
  const { enqueueSuccessSnackbar } = useSuccessSnackbar();

  const units = window.innerHeight > window.innerWidth ? "vw" : "vh";
  const modalSize = 100 + units;
  const iconSize =
    0.9 * (units === "vw" ? window.innerWidth : window.innerHeight);

  return (
    <Tooltip title="Download SVG">
      <CenteredModal
        open={open}
        onClose={onClose}
        width={modalSize}
        height={modalSize}
      >
        <QRCode
          onClick={(event) => {
            const svgElement =
              (event.nativeEvent.target as HTMLElement)?.parentNode ||
              (event.nativeEvent.target as Node);

            const xmlSerializer = new XMLSerializer();
            const svgString = xmlSerializer.serializeToString(svgElement);

            const pathToSaveTo = dialog.showSaveDialogSync({
              defaultPath: "QR Code",
              filters: [{ name: "SVG Images", extensions: ["svg"] }],
            });

            if (!pathToSaveTo) return;

            try {
              writeFileSync(pathToSaveTo, svgString);
              enqueueSuccessSnackbar({
                successMessage: "QR code saved as file",
              });
            } catch (e) {
              enqueueErrorSnackbar({
                errorMessage: `Couldn't save QR code: ${e?.message ?? e}`,
              });
            }
          }}
          css={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            cursor: "pointer",
          }}
          width={iconSize}
          height={iconSize}
          renderAs="svg"
          value={qrCodeValue}
        />
      </CenteredModal>
    </Tooltip>
  );
};
