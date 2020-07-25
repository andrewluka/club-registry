/** @jsx jsx */
import { jsx } from "@emotion/core";
import { Fragment, useState } from "react";
import { AppBar } from "../components/AppBar";
import { FormWrapper } from "../components/FormWrapper";
import { QRScannerTextField } from "../components/QRScannerTextField";
import { Button } from "@material-ui/core";
import QRCode from "qrcode.react";
import { addGame } from "../services/tablesServices";
import { useErrorSnackbar } from "../hooks/useErrorSnackbar";
import { Routes } from "../routes";

export const AddGame = () => {
  const { enqueueErrorSnackbar } = useErrorSnackbar();
  const [gameName, setGameName] = useState("");
  const [game_id, set_game_id] = useState<null | number>(null);

  const onSubmit = () => {
    if (!gameName.trim())
      enqueueErrorSnackbar({ errorMessage: "Invalid game name" });

    const game_id = addGame({ name: gameName });

    if (game_id === false) enqueueErrorSnackbar();
    else {
      set_game_id(game_id);
    }
  };

  return (
    <Fragment>
      <AppBar title="Add Game" backButton backButtonRoute={Routes.GAMES} />

      <FormWrapper>
        <QRScannerTextField
          label="Game's name"
          qrVideoScanningEnabled={false}
          value={gameName}
          onChange={setGameName}
        />

        <Button color="primary" variant="contained" onClick={onSubmit}>
          Submit
        </Button>
      </FormWrapper>
    </Fragment>
  );
};
