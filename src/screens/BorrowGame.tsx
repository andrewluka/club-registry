/** @jsx jsx */
import { jsx } from "@emotion/core";
import { AppBar } from "../components/AppBar";
import { QRScannerTextField } from "../components/QRScannerTextField";
import { useState, Fragment } from "react";
import { Button } from "@material-ui/core";
import { FormWrapper } from "../components/FormWrapper";
import { Routes } from "../routes";

export const BorrowGame = () => {
  let [userId, setUserId] = useState("");

  return (
    <Fragment>
      <AppBar backButton title="Borrow Game" backButtonRoute={Routes.HOME} />

      <FormWrapper>
        <QRScannerTextField
          label="User's ID"
          value={userId}
          onChange={(newVal) => setUserId(newVal)}
        />
        <QRScannerTextField
          label="Game's ID"
          value={userId}
          onChange={(newVal) => setUserId(newVal)}
        />

        <Button variant="contained" color="primary">
          Submit
        </Button>
      </FormWrapper>
    </Fragment>
  );
};
