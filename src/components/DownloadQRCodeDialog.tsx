/** @jsx jsx */
import { jsx } from "@emotion/core";
import { FC, useState, useEffect } from "react";
import QRCode from "qrcode";
import Electron from "electron";
import fs from "fs";
import { useErrorSnackbar } from "../hooks/useErrorSnackbar";
import { useSuccessSnackbar } from "../hooks/useSuccessSnackbar";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@material-ui/core";

const qrCodetoSvgString = (window.require("qrcode") as typeof QRCode).toString;
const { writeFileSync } = window.require("fs") as typeof fs;

const electron: typeof Electron = window.require("electron");
const { dialog } = electron.remote;

interface Props {
  open: boolean;
  onClose: () => void;
  qrCodeValue: string;
}

export const DownloadQRCodeDialog: FC<Props> = ({
  open,
  onClose,
  qrCodeValue,
}) => {
  const [qrCodeSvgString, setQrCodeSvgString] = useState("");

  const { enqueueErrorSnackbar } = useErrorSnackbar();
  const { enqueueSuccessSnackbar } = useSuccessSnackbar();

  useEffect(() => {
    qrCodetoSvgString(qrCodeValue, { type: "svg" }).then(setQrCodeSvgString);
  }, [qrCodeValue]);

  const units = window.innerHeight > window.innerWidth ? "vw" : "vh";
  const iconSize =
    0.6 * (units === "vw" ? window.innerWidth : window.innerHeight);

  const qrCodeSvgUri = `data:image/svg+xml;base64,${new Buffer(
    qrCodeSvgString
  ).toString("base64")}`;

  return (
    <Dialog open={open}>
      <DialogTitle>Download QR Code?</DialogTitle>
      <DialogContent>
        <img src={qrCodeSvgUri} width={iconSize} height={iconSize} />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>Cancel</Button>
        <Button
          onClick={async () => {
            const pathToSaveTo = dialog.showSaveDialogSync({
              defaultPath: "QR Code",
              filters: [{ name: "SVG Images", extensions: ["svg"] }],
            });

            if (pathToSaveTo) {
              const svgString =
                qrCodeSvgString || (await qrCodetoSvgString(qrCodeValue));

              try {
                writeFileSync(pathToSaveTo, svgString);
                enqueueSuccessSnackbar({
                  successMessage: "QR code saved as file",
                });
              } catch (e) {
                enqueueErrorSnackbar({
                  errorMessage: `Couldn't save QR code: ${e?.message || e}`,
                });
              }
            }

            onClose();
          }}
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};
