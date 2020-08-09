/** @jsx jsx */
import { jsx } from "@emotion/core";
import {
  TextField,
  IconButton,
  Tooltip,
  StandardTextFieldProps,
} from "@material-ui/core";
import { ThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import { FC, useState, Fragment } from "react";
import { QRCodeIcon } from "./QRCodeIcon";
import QrReader from "react-qr-reader";
import { CenteredModal } from "./CenteredModal";

interface Props
  extends Omit<Omit<StandardTextFieldProps, "onChange">, "disabled"> {
  value: string;
  onChange: (newVal: string) => void;
  inputMethod?: "qr" | "text" | "both";
}

export const QRScannerTextField: FC<Props> = ({
  value,
  onChange,
  inputMethod = "both",
  ...textFieldProps
}) => {
  const textFieldEnabled = inputMethod === "text" || inputMethod === "both";

  const qrVideoScanningEnabled = inputMethod === "qr" || inputMethod === "both";

  let [isQrScanVideoOpen, setIsQrScanVideoOpen] = useState(false);
  let [isQrScanVideoLoaded, setIsQrScanVideoLoaded] = useState(false);

  const beforeOpacity = 0.7;
  const afterOpacity = 1.0;

  const closeQrVideo = () => {
    if (!isQrScanVideoLoaded) return;

    setIsQrScanVideoOpen(false);
    setIsQrScanVideoLoaded(false);
  };

  // const muiTheme = createMuiTheme({
  //   overrides: {
  //     MuiTextField: {
  //       root: {
  //         "& label": { color: emotionTheme.primaryTextColor },
  //         "& div:before": {
  //           borderBottomColor: emotionTheme.primaryTextColor,
  //           opacity: beforeOpacity,
  //         },
  //         "& div:hover": { opacity: afterOpacity },
  //       },
  //     },
  //   },

  // });

  const modalUnits = window.innerHeight > window.innerWidth ? "vw" : "vh";
  const modalSize = `90${modalUnits}`;

  return (
    <Fragment>
      {isQrScanVideoOpen && qrVideoScanningEnabled && (
        <CenteredModal
          open={isQrScanVideoOpen && qrVideoScanningEnabled}
          onClose={closeQrVideo}
        >
          <QrReader
            css={{
              width: modalSize,
              height: modalSize,
              position: "fixed",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
            onLoad={() => setIsQrScanVideoLoaded(true)}
            onError={console.error}
            onScan={(data) => {
              if (data !== null && data !== undefined) {
                onChange?.(data);
                setIsQrScanVideoOpen(false);
              }
            }}
          />
        </CenteredModal>
      )}
      <div
        css={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-end",
        }}
      >
        <TextField
          margin="normal"
          variant="standard"
          {...textFieldProps}
          value={value}
          onChange={(evt) => onChange?.(evt.target.value)}
          disabled={!textFieldEnabled}
        />

        {qrVideoScanningEnabled && (
          <Tooltip title="Scan QR Code">
            <IconButton
              color="primary"
              css={{
                opacity: beforeOpacity,
                ":hover": {
                  opacity: afterOpacity,
                },
              }}
              onClick={() => setIsQrScanVideoOpen(true)}
            >
              <QRCodeIcon color="primary" />
            </IconButton>
          </Tooltip>
        )}
      </div>
      {/* </ThemeProvider> */}
    </Fragment>
  );
};
