/** @jsx jsx */
import { jsx } from "@emotion/core";
import { TextField, IconButton, Fab, Modal } from "@material-ui/core";
import { ThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import { FC, useState } from "react";
import { useTheme as useEmotionTheme } from "emotion-theming";
import { Theme } from "../../typings/theme";
import ScanQRIcon from "@material-ui/icons/PhotoCamera";
import QrReader from "react-qr-reader";

interface Props {
  defaultValue?: string;
  value?: string;
  onChange?: (newVal: string) => void;
  error?: boolean;
  label?: string;
  helperText?: string;
  qrVideoScanningEnabled?: boolean;
}

export const QRScannerTextField: FC<Props> = ({
  defaultValue,
  value,
  onChange,
  error,
  label,
  helperText,
  qrVideoScanningEnabled = true,
}) => {
  let [isQrScanVideoOpen, setIsQrScanVideoOpen] = useState(false);
  let [isQrScanVideoLoaded, setIsQrScanVideoLoaded] = useState(false);
  const emotionTheme = useEmotionTheme<Theme>();

  const beforeOpacity = 0.7;
  const afterOpacity = 1.0;

  const closeQrVideo = () => {
    if (!isQrScanVideoLoaded) return;

    setIsQrScanVideoOpen(false);
    setIsQrScanVideoLoaded(false);
  };

  const muiTheme = createMuiTheme({
    palette: {
      primary: { main: emotionTheme.primaryColor },
      text: { primary: emotionTheme.primaryTextColor },
    },
    overrides: {
      MuiTextField: {
        root: {
          "& label": { color: emotionTheme.primaryTextColor },
          "& div:before": {
            borderBottomColor: emotionTheme.primaryTextColor,
            opacity: beforeOpacity,
          },
          "& div:hover": { opacity: afterOpacity },
        },
      },
    },
  });

  const modalUnits = window.innerHeight > window.innerWidth ? "vw" : "vh";
  const modalSize = `90${modalUnits}`;

  return (
    <ThemeProvider theme={muiTheme}>
      {isQrScanVideoOpen && qrVideoScanningEnabled && (
        <Modal
          open={isQrScanVideoOpen && qrVideoScanningEnabled}
          onClose={closeQrVideo}
        >
          <div>
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
          </div>
        </Modal>
      )}

      <div
        css={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-end",
        }}
      >
        <TextField
          label={label}
          defaultValue={defaultValue}
          helperText={helperText}
          margin="normal"
          variant="standard"
          value={value}
          onChange={(evt) => onChange?.(evt.target.value)}
          error={error}
        />
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
          <ScanQRIcon color="primary" />
        </IconButton>
      </div>
    </ThemeProvider>
  );
};
