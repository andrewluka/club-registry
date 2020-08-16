/** @jsx jsx */
import { jsx } from "@emotion/core";
import { AppBar } from "../components/AppBar";
import { Drawer } from "../components/Drawer";
import { Fragment } from "react";
import { ContentWrapper } from "../components/ContentWrapper";
import { DataTable, DataTableColumnDef } from "../components/DataTable";
import { useAttendanceData } from "../hooks/useAttendanceData";
import { useIsThereOpenSession } from "../hooks/useIsThereOpenSession";
import {
  getCurrentSession,
  markUserForCurrentSession,
} from "../services/attendanceServices";
import { getMUIDatatableCheckboxRenderer } from "../components/getMUIDatatableCheckboxRenderer";
import { AttendanceRecord } from "../typings/attendance";
import { useUsers } from "../hooks/useUsers";
import { getUser } from "../services/usersServices";
import moment from "moment";
import {
  SPELLED_OUT_DATE_AND_TIME_FORMAT,
  SPELLED_OUT_DATE_FORMAT,
  HOURS_WITH_MERIDIAN,
} from "../constants/dates";
import { getDataTableDateFilterOptions } from "../utils/getDataTableFilterDateOptions";
import { useSessions } from "../hooks/useSessions";
import { CurrentSessionData } from "../components/CurrentSessionData";

export const Attendance = () => {
  const {
    data: rawAttendanceData,
    refresh: refreshAttendanceData,
  } = useAttendanceData();
  const { data: isThereOpenSession } = useIsThereOpenSession();
  const { data: users } = useUsers();
  const { data: sessions } = useSessions();

  const thisSessionsAttendance = (() => {
    const session_id = getCurrentSession()?.payload?.session_id;

    if (typeof session_id !== "number") return [];

    const thisSessionAttendance = rawAttendanceData.filter(
      ({ session }) => session === session_id
    );

    const rows: AttendanceRecord[] = [];

    for (const { user_id } of users) {
      const record = thisSessionAttendance.find(
        ({ attendee }) => attendee === user_id
      ) || {
        attendee: user_id,
        session: session_id,
        attendee_arrival_time: null,
      };
      rows.push(record);
    }

    return rows;
  })();

  const allAttendanceRows = (() => {
    const result = [];

    for (const { user_id } of users) {
      const userAttendanceRecord: Record<string, null | undefined | number> = {
        user_id,
      };

      for (const { session_id } of sessions) {
        const {
          attendee_arrival_time,
        }: AttendanceRecord = rawAttendanceData.find(
          ({ attendee, session }) =>
            attendee === user_id && session === session_id
        ) || {
          attendee_arrival_time: null,
          session: session_id,
          attendee: user_id,
        };

        userAttendanceRecord[session_id] = attendee_arrival_time;
      }

      result.push(userAttendanceRecord);
    }

    return result;
  })();

  return (
    <Fragment>
      <AppBar title="Attendance" />
      <Drawer />

      <ContentWrapper>
        <CurrentSessionData />
        {isThereOpenSession && (
          <DataTable
            title="This session's attendance"
            rows={thisSessionsAttendance}
            columns={[
              {
                name: "attendee",
                label: "User ID",
                options: {
                  filter: false,
                },
              },
              {
                name: "attendee",
                label: "User's name",
                options: {
                  filter: false,
                  customBodyRender: (id) =>
                    (getUser(id)?.payload as any)?.name || "",
                },
              },
              {
                name: "attendee_arrival_time",
                label: "Present?",
                options: {
                  filter: false,
                  searchable: false,
                  customBodyRender: getMUIDatatableCheckboxRenderer({
                    check: (user_id) => {
                      const resp = markUserForCurrentSession(user_id);
                      refreshAttendanceData();
                      return resp;
                    },
                  }),
                },
              },
              {
                name: "attendee_arrival_time",
                label: "Arrived at",
                options: {
                  customBodyRender: (date) =>
                    typeof date === "number"
                      ? moment(date).format(SPELLED_OUT_DATE_AND_TIME_FORMAT)
                      : "",
                  ...getDataTableDateFilterOptions({
                    rows: thisSessionsAttendance,
                    extractDate: ({ attendee_arrival_time }) =>
                      attendee_arrival_time,
                    shouldShowDays: true,
                    shouldShowHours: true,
                    shouldShowMonths: true,
                    shouldShowYears: true,
                  }),
                },
              },
            ]}
          />
        )}
        <DataTable
          title="All Attendance data"
          columns={[
            {
              name: "user_id",
              label: "User",
              options: {
                filter: false,
                customBodyRender: (id) =>
                  `${id} - ${(getUser(id)?.payload as any)?.name || ""}`,
              },
            },
            ...sessions.map(
              ({ session_start, session_id }): DataTableColumnDef => ({
                name: String(session_id),
                label: moment(session_start).format(
                  SPELLED_OUT_DATE_AND_TIME_FORMAT
                ),
                options: {
                  customBodyRender: (date_arrived) =>
                    date_arrived
                      ? moment(date_arrived).format(HOURS_WITH_MERIDIAN)
                      : "",
                  ...getDataTableDateFilterOptions({
                    extractDate: (row) => row[String(session_id)],
                    rows: allAttendanceRows,
                  }),
                },
              })
            ),
          ]}
          rows={allAttendanceRows}
        />
      </ContentWrapper>
    </Fragment>
  );
};
