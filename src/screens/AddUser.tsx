/** @jsx jsx */
import { jsx, css } from "@emotion/core";
import { Fragment, useState } from "react";
import { AppBar } from "../components/AppBar";
import { Routes } from "../constants/routes";
import { Button } from "@material-ui/core";
import { QRScannerTextField } from "../components/QRScannerTextField";
import { KeyboardDatePicker } from "@material-ui/pickers";
import { useErrorSnackbar } from "../hooks/useErrorSnackbar";
import { Moment } from "moment";
import { useConfirmDialog } from "../hooks/useConfirmDialog";
import { addUser } from "../services/usersServices";
import { useHistory } from "react-router-dom";
import { useSuccessSnackbar } from "../hooks/useSuccessSnackbar";
import { DATE_FORMAT } from "../constants/dates";

const centerChildStyles = css({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

export const AddUser = () => {
  let [name, setName] = useState("");
  let [phoneNumber, setPhoneNumber] = useState("");
  let [userDateOfBirth, setUserDateOfBirth] = useState<Moment | null>(null);

  const { enqueueErrorSnackbar } = useErrorSnackbar();
  const { enqueueSuccessSnackbar } = useSuccessSnackbar();
  const { confirm } = useConfirmDialog();
  const history = useHistory();

  const checkPhoneNumberInput = (input: string) =>
    /^\d+$/.test(input) ||
    // also allow empty string
    !input;

  const onSubmit = async () => {
    const date_of_birth = userDateOfBirth?.isValid() ? userDateOfBirth : null;

    if (!name) {
      return enqueueErrorSnackbar({ errorMessage: "Invalid name" });
    }

    const undefinedElement = <span css={{ opacity: 0.7 }}>null</span>;

    const shouldCreateUser = await confirm({
      title: "Are you sure?",
      content: (
        <Fragment>
          A new user will be created with the following fields:
          <ul>
            <li>name: {name}</li>
            <li>phone number: {phoneNumber || undefinedElement}</li>
            <li>
              date of birth:{" "}
              {date_of_birth?.format(DATE_FORMAT) || undefinedElement}
            </li>
          </ul>
        </Fragment>
      ),
    });

    if (!shouldCreateUser) return;

    const wasOperationSuccessful = addUser({
      name,
      ...(date_of_birth
        ? { date_of_birth: date_of_birth.toDate().getTime() }
        : {}),
      ...(phoneNumber ? { phone_number: phoneNumber } : {}),
    });

    if (wasOperationSuccessful) {
      history.replace(Routes.USERS);
      enqueueSuccessSnackbar({ successMessage: "Added user" });
    } else {
      enqueueErrorSnackbar({ errorMessage: "Failed to add user" });
    }
  };

  return (
    <Fragment>
      <AppBar title="Add User" backButton backButtonRoute={Routes.USERS} />
      <div
        css={{
          width: "100vw",
          height: "100vh",
          display: "grid",
          gridGap: "10px",
          gridTemplateColumns: "repeat(3, 1fr)",
          gridTemplateRows: "2fr 1fr",
        }}
      >
        <div css={[{ gridColumn: "1", gridRow: "1" }, centerChildStyles]}>
          <QRScannerTextField
            inputMethod="text"
            onChange={setName}
            value={name}
            label="User's name"
            required
          />
        </div>
        <div css={[{ gridColumn: "2", gridRow: "1" }, centerChildStyles]}>
          <QRScannerTextField
            inputMethod="text"
            onChange={(newVal) =>
              checkPhoneNumberInput(newVal) && setPhoneNumber(newVal)
            }
            value={phoneNumber}
            label="User's phone number"
          />
        </div>
        <div css={[{ gridColumn: "3", gridRow: "1" }, centerChildStyles]}>
          <KeyboardDatePicker
            value={userDateOfBirth}
            onChange={(newDate) => setUserDateOfBirth(newDate || null)}
            disableFuture
            label="User's date of birth"
            format={DATE_FORMAT}
          />
        </div>
        <div css={[{ gridColumn: "1 / 4", gridRow: "2" }, centerChildStyles]}>
          <Button onClick={onSubmit} variant="contained" color="primary">
            Submit
          </Button>
        </div>
      </div>
    </Fragment>
  );
};
