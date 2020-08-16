/** @jsx jsx */
import { jsx } from "@emotion/core";
import { Paper, Typography, Button } from "@material-ui/core";
import {
  getCurrentSession,
  closeSession,
  startSession,
} from "../services/attendanceServices";
import { SPELLED_OUT_DATE_AND_TIME_FORMAT } from "../constants/dates";
import { useIsThereOpenSession } from "../hooks/useIsThereOpenSession";
import moment from "moment";
import { useTimer } from "../hooks/useTimer";

function ms2time(timeInMs: number) {
  const pad = (num: number, size: number) => {
    return ("000" + num).slice(size * -1);
  };
  const time = timeInMs / 1000;
  const hours = Math.floor(time / 60 / 60);
  const minutes = Math.floor(time / 60) % 60;
  const seconds = Math.floor(time - minutes * 60);

  return pad(hours, 2) + ":" + pad(minutes, 2) + ":" + pad(seconds, 2);
}

export const CurrentSessionData = () => {
  const {} = useTimer(
    getCurrentSession()?.payload?.session_start || Date.now()
  );
  const { data: isThereOpenSession } = useIsThereOpenSession();

  return (
    <Paper
      css={{
        width: "calc(100% - 20px)",
        height: 50,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",

        "& *": {
          marginLeft: 20,
          marginRight: 20,
        },
      }}
      variant="outlined"
    >
      <Typography component="span" variant="body1">
        Started on:{" "}
        {isThereOpenSession
          ? moment(getCurrentSession()?.payload?.session_start).format(
              SPELLED_OUT_DATE_AND_TIME_FORMAT
            )
          : ""}
      </Typography>

      <Typography component="span" variant="body1">
        Time since:{" "}
        {isThereOpenSession
          ? ms2time(
              Date.now() -
                (getCurrentSession()?.payload?.session_start || Date.now())
            )
          : "00:00:00"}
      </Typography>

      {isThereOpenSession ? (
        <Button onClick={closeSession}>End current session</Button>
      ) : (
        <Button onClick={startSession}>Start new session</Button>
      )}
    </Paper>
  );
};
