/** @jsx jsx */
import { jsx } from "@emotion/core";
import { useQueryParams } from "../hooks/useQueryParams";
import { ReturnGameQueryParams, Routes } from "../constants/routes";
import { Fragment, useState } from "react";
import { AppBar } from "../components/AppBar";
import { QRScannerTextField } from "../components/QRScannerTextField";
import { Button } from "@material-ui/core";
import { useErrorSnackbar } from "../hooks/useErrorSnackbar";
import { returnGame } from "../services/gamesServices";
import { useHistory } from "react-router-dom";
import { useSuccessSnackbar } from "../hooks/useSuccessSnackbar";

export const ReturnGame = () => {
  const history = useHistory();
  const { enqueueErrorSnackbar } = useErrorSnackbar();
  const { enqueueSuccessSnackbar } = useSuccessSnackbar();

  let [scannedUserId, setScannedUserId] = useState("");
  let [scannedGameId, setScannedGameId] = useState("");

  const queryParams = useQueryParams();
  const user_id = queryParams.get(ReturnGameQueryParams.user_id);
  const game_id = queryParams.get(ReturnGameQueryParams.game_id);

  const onSubmit = () => {
    if (user_id !== scannedUserId) {
      console.log({ user_id, scannedUserId });

      return enqueueErrorSnackbar({
        errorMessage: "Provided User ID does not match the expected one",
      });
    }

    if (game_id !== scannedGameId) {
      console.log({ game_id, scannedGameId });

      return enqueueErrorSnackbar({
        errorMessage: "Provided Game ID does not match the expected one",
      });
    }

    const wasOperationSuccessful = returnGame({
      borrower: Number(scannedUserId),
      game: Number(scannedGameId),
    });

    if (wasOperationSuccessful) {
      history.replace(Routes.HOME);
      enqueueSuccessSnackbar();
    } else {
      enqueueErrorSnackbar();
    }
  };

  return (
    <Fragment>
      <AppBar title="Return Game" backButton backButtonRoute={Routes.HOME} />
      <div
        css={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-evenly",
          flexDirection: "column",
        }}
      >
        <QRScannerTextField
          inputMethod="qr"
          label="Game ID"
          value={scannedGameId}
          onChange={setScannedGameId}
        />
        <QRScannerTextField
          inputMethod="qr"
          label="User ID"
          value={scannedUserId}
          onChange={setScannedUserId}
        />

        <Button color="primary" variant="contained" onClick={onSubmit}>
          Submit
        </Button>
      </div>
    </Fragment>
  );
};
