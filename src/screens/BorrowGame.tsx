/** @jsx jsx */
import { jsx } from "@emotion/core";
import { AppBar } from "../components/AppBar";
import { QRScannerTextField } from "../components/QRScannerTextField";
import { useState, Fragment } from "react";
import { Button } from "@material-ui/core";
import { Routes } from "../constants/routes";
import { useErrorSnackbar } from "../hooks/useErrorSnackbar";
import { borrowGame } from "../services/gamesServices";
import { useSuccessSnackbar } from "../hooks/useSuccessSnackbar";
import { useHistory } from "react-router-dom";

export const BorrowGame = () => {
  let [userId, setUserId] = useState("");
  let [gameId, setGameId] = useState("");

  const { enqueueErrorSnackbar } = useErrorSnackbar();
  const { enqueueSuccessSnackbar } = useSuccessSnackbar();
  const history = useHistory();

  const checkInput = (input: string) =>
    /^\d+$/.test(input) ||
    // also allow empty string
    !input;

  const isValidId = (input: string) => /^\d+$/.test(input);

  return (
    <Fragment>
      <AppBar backButton title="Borrow Game" backButtonRoute={Routes.HOME} />

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
          label="User's ID"
          value={userId}
          onChange={(newVal) => checkInput(newVal) && setUserId(newVal)}
          required
        />
        <QRScannerTextField
          label="Game's ID"
          value={gameId}
          onChange={(newVal) => checkInput(newVal) && setGameId(newVal)}
          required
        />

        <Button
          onClick={() => {
            if (!isValidId(userId) || !isValidId(gameId)) {
              return enqueueErrorSnackbar({
                errorMessage: "User ID or Game ID is invalid",
              });
            }

            const wasOperationSuccessful = borrowGame({
              borrower: Number(userId),
              game: Number(gameId),
            });

            if (wasOperationSuccessful) {
              enqueueSuccessSnackbar();
              return history.replace(Routes.HOME);
            } else {
              return enqueueErrorSnackbar();
            }
          }}
          variant="contained"
          color="primary"
        >
          Submit
        </Button>
      </div>
    </Fragment>
  );
};
