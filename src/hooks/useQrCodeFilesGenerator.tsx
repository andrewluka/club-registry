/** @jsx jsx */
import { jsx } from "@emotion/core";
import { useEffect, useState } from "react";
import { yielding, forEachAsync } from "js-coroutines";
import ReactDOM from "react-dom";
import { ThemeProvider, useTheme } from "@material-ui/core/styles";
import QRCode from "qrcode";
import { join } from "path";
import { writeFileSync as WriteFileSync } from "fs";
import { Dialog } from "electron";
import { ModalLinearProgress } from "../components/ModalLinearProgress";
import { useSuccessSnackbar } from "./useSuccessSnackbar";
import { useDismissableSnackbar } from "./useDismissableSnackbar";

const dialog: Dialog = window.require("electron").remote.dialog;

const qrCodetoSvgString = (window.require("qrcode") as typeof QRCode).toString;
const writeFileSync: typeof WriteFileSync = window.require("fs").writeFileSync;

interface Value {
  data: string;
  nickname: string;
}

interface Options {
  values: Value[];
}

export const useQrCodeFilesGenerator = () => {
  const muiTheme = useTheme();
  const { enqueueSuccessSnackbar } = useSuccessSnackbar();
  const { enqueueDismissableSnackbar } = useDismissableSnackbar();

  const modalRoot = document.getElementById("qrcode-modal") as HTMLDivElement;

  const generateQrCodes = ({ values }: Options) => {
    if (values.length <= 0) {
      return enqueueDismissableSnackbar({
        message: "No values to encode",
      });
    }

    const qrCodesDestination = dialog.showOpenDialogSync({
      properties: ["openDirectory"],
    })?.[0];

    if (!qrCodesDestination || values.length <= 0) return;

    return new Promise((resolve, reject) => {
      const Generator = () => {
        let [progress, setProgress] = useState(0);

        const generateQrCode = async (
          { nickname, data }: Value,
          index: number
        ) => {
          try {
            const filePath = join(
              qrCodesDestination,
              `${data}_${nickname}.svg`
            );

            const svgString = await qrCodetoSvgString(data, {
              type: "svg",
            });

            writeFileSync(filePath, svgString);
            setProgress(((index + 1) / values.length) * 100);

            const finalize = () => {
              ReactDOM.unmountComponentAtNode(modalRoot);
              enqueueSuccessSnackbar({
                successMessage: `Saved ${values.length} SVG(s) to ${qrCodesDestination}`,
              });
              resolve();
            };

            if (values.length - 1 === index) setTimeout(finalize, 1000);
          } catch (e) {
            reject(e);
          }
        };

        useEffect(() => {
          forEachAsync(values, yielding(generateQrCode));
        }, []);

        return (
          <ThemeProvider theme={muiTheme}>
            <ModalLinearProgress open variant="determinate" value={progress} />
          </ThemeProvider>
        );
      };

      ReactDOM.render(<Generator />, modalRoot);
    });
  };

  return { generateQrCodes };
};
