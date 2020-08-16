import React, { useState } from "react";
import { Drawer } from "../components/Drawer";
import { AppBar } from "../components/AppBar";
import { ContentWrapper } from "../components/ContentWrapper";
import { useUsers } from "../hooks/useUsers";
import { DataTable, DataTableColumnDef } from "../components/DataTable";
import {
  removeUser,
  getUser,
  updateUserName,
  suspendUser,
  unsuspendUser,
  updateUserDateOfBirth,
  updateUserPhoneNumber,
} from "../services/usersServices";
import { getMUIDatatableEditableRenderer } from "../components/getMUIDatatableEditableRenderer";
import { getMUIDatatableCheckboxRenderer } from "../components/getMUIDatatableCheckboxRenderer";
import { CornerFab } from "../components/CornerFab";
import { Routes } from "../constants/routes";
import AddIcon from "@material-ui/icons/Add";
import { getMUIDatatableQRCodeRenderer } from "../components/getMUIDatatableQRCodeRenderer";
import moment, { Moment } from "moment";
import { useQrCodeFilesGenerator } from "../hooks/useQrCodeFilesGenerator";
import { SPELLED_OUT_DATE_FORMAT } from "../constants/dates";
import { useTheme } from "@material-ui/core/styles";
import { User } from "../typings/user";
import { getDataTableDateFilterOptions } from "../utils/getDataTableFilterDateOptions";
import { DatePicker } from "@material-ui/pickers";
import { useErrorSnackbar } from "../hooks/useErrorSnackbar";
import { useSuccessSnackbar } from "../hooks/useSuccessSnackbar";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
import { isNumOrEmpty } from "../utils/isNumOrEmpty";
import { getDataTableIsSuspendedOptions } from "../utils/getDataTableIsSuspendedOptions";
import { getDateOfAdditionColumnDef } from "../utils/getDateOfAdditionColumnDef";
import { getDateSearcher } from "../utils/getDateSearcher";
import { useHistory } from "react-router-dom";
import { CurrentSessionData } from "../components/CurrentSessionData";

export const Users = () => {
  const { data: rows } = useUsers();
  const { generateQrCodes } = useQrCodeFilesGenerator();
  const { enqueueErrorSnackbar } = useErrorSnackbar();
  const { enqueueSuccessSnackbar } = useSuccessSnackbar();

  const history = useHistory();
  const theme = useTheme();

  const columns: DataTableColumnDef[] = [
    {
      label: "ID",
      name: "user_id",
      options: {
        filter: false,
      },
    },
    {
      name: "name",
      label: "Name",
      options: {
        filter: false,
        customBodyRender: getMUIDatatableEditableRenderer({
          get: (id) => {
            const { payload, isError } = getUser(id);

            if (isError) return { payload: payload, isError } as any;

            return {
              isError: false,
              payload: String(payload?.name || ""),
            };
          },
          update: ({ id, newValue }) =>
            updateUserName({ user_id: id, newName: newValue }),
        }),
      },
    },
    {
      label: "Date of Birth",
      name: "date_of_birth",
      options: {
        ...getDataTableDateFilterOptions<User>({
          extractDate: ({ date_of_birth }) => date_of_birth,
          rows,
        }),
        customBodyRender: (_, tableMeta) => {
          const date_of_birth = tableMeta.rowData[2];
          const user_id = tableMeta.rowData[0];

          const Picker = () => {
            const purifyDate = (date_of_birth: number | null | undefined) =>
              (typeof date_of_birth === "number" && moment(date_of_birth)) ||
              null;

            const [date, setDate] = useState<Moment | null>(
              purifyDate(date_of_birth)
            );

            const onChange = (date: MaterialUiPickersDate) => {
              if (date && !date.isValid()) {
                setDate(purifyDate(date_of_birth));
                return enqueueErrorSnackbar({
                  errorMessage: "Invalid date",
                });
              }

              const newDateOfBirth = date?.toDate().getTime() ?? null;
              if (newDateOfBirth === date_of_birth) return;

              updateUserDateOfBirth({ user_id, newDateOfBirth });
              enqueueSuccessSnackbar({
                successMessage: "Date updated",
              });
            };

            return (
              <DatePicker
                value={date}
                onChange={onChange}
                clearable
                disableFuture
                format={SPELLED_OUT_DATE_FORMAT}
              />
            );
          };

          return <Picker />;
        },
      },
    },
    {
      label: "Phone number",
      name: "phone_number",
      options: {
        filter: false,
        customBodyRender: getMUIDatatableEditableRenderer({
          validateInput: isNumOrEmpty,
          get: (id) => {
            const { payload, isError } = getUser(id);

            if (isError) return { payload: payload, isError } as any;

            return {
              isError: false,
              payload: String((payload as User)?.phone_number || ""),
            };
          },
          update: ({ id, newValue }) =>
            updateUserPhoneNumber({
              user_id: id,
              newPhoneNumber: newValue,
            }),
        }),
      },
    },
    getDateOfAdditionColumnDef({
      rows,
      extractDate: ({ date_of_addition }) => date_of_addition,
    }),
    {
      name: "is_suspended",
      label: "Suspended?",
      options: {
        customBodyRender: getMUIDatatableCheckboxRenderer({
          check: suspendUser,
          uncheck: unsuspendUser,
        }),
        ...getDataTableIsSuspendedOptions(),
      },
    },
    {
      name: "user_id",
      label: "Generate & Download all QR Codes",
      options: {
        customBodyRender: getMUIDatatableQRCodeRenderer(),
        filter: false,
        sort: false,
        print: false,
        download: false,
        viewColumns: false,
        setCellHeaderProps: () => ({
          onClick: async () => {
            await generateQrCodes({
              values: rows.map(({ user_id, name }) => ({
                data: String(user_id),
                nickname: name,
              })),
            });
          },
          style: {
            color: theme.palette.primary.main,
            cursor: "pointer",
          },
        }),
      },
    },
  ];

  return (
    <React.Fragment>
      <Drawer />
      <AppBar title="Users" />
      <ContentWrapper>
        <CurrentSessionData />
        <DataTable
          title="Users"
          columns={columns}
          rows={rows}
          getRowId={({ user_id }) => user_id}
          remove={removeUser}
          customSearch={getDateSearcher({
            namesOfColumnsWithDates: ["date_of_birth", "date_of_addition"],
          })}
        />
      </ContentWrapper>
      <CornerFab
        tooltipTitle="Add User"
        onClick={() => history.push(Routes.ADD_USER)}
        Icon={AddIcon}
      />
    </React.Fragment>
  );
};
