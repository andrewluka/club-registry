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
import { useSuccessSnackbar } from "../hooks/useSuccessSnackbar";
import { Routes } from "../routes";
import { useHistory } from "react-router-dom";

// TODO add QR code generator on submit
export const AddGame = () => {
  const history = useHistory();
  const { enqueueErrorSnackbar } = useErrorSnackbar();
  const { enqueueSuccessSnackbar } = useSuccessSnackbar();
  const [gameName, setGameName] = useState("");
  const [game_id, set_game_id] = useState<null | number>(null);

  const onSubmit = () => {
    if (!gameName.trim()) {
      enqueueErrorSnackbar({ errorMessage: "Invalid game name" });
      return;
    }

    const game_id = addGame({ name: gameName });

    if (game_id === false) enqueueErrorSnackbar();
    else {
      set_game_id(game_id);
      history.replace(Routes.GAMES);
      enqueueSuccessSnackbar();
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
