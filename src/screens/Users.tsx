import React, { useState } from "react";
import { Drawer } from "../components/Drawer";
import { AppBar } from "../components/AppBar";
import { TableWrapper } from "../components/TableWrapper";
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
import { getMUIDatatableIsSuspendedRenderer } from "../components/getMUIDatatableIsSuspendedRenderer";
import { RedirectCornerFab } from "../components/RedirectCornerFab";
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
import { isNotNullOrUndefined } from "../utils/isNotNullOrUndefined";

export const Users = () => {
  const { data: rows } = useUsers();
  const { generateQrCodes } = useQrCodeFilesGenerator();
  const { enqueueErrorSnackbar } = useErrorSnackbar();
  const { enqueueSuccessSnackbar } = useSuccessSnackbar();

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
          get: (user_id) => getUser(user_id).name,
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
          get: (user_id) => getUser(user_id).phone_number || "",
          update: ({ id, newValue }) =>
            updateUserPhoneNumber({
              user_id: id,
              newPhoneNumber: newValue,
            }),
        }),
      },
    },
    {
      name: "is_suspended",
      label: "Suspended?",
      options: {
        customBodyRender: getMUIDatatableIsSuspendedRenderer({
          suspend: suspendUser,
          unsuspend: unsuspendUser,
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
      <TableWrapper>
        <DataTable
          title="Users"
          columns={columns}
          rows={rows}
          getRowId={({ user_id }) => user_id}
          remove={removeUser}
          customSearch={(searchQuery, rawRow, columns) => {
            const row = [...rawRow];
            const dateOfBirthIndex = columns.findIndex(
              ({ name }) => name === "date_of_birth"
            );
            row[dateOfBirthIndex] = moment(row[dateOfBirthIndex]).format(
              SPELLED_OUT_DATE_FORMAT
            );
            searchQuery = searchQuery.toLowerCase();

            const rowString = row
              .filter(isNotNullOrUndefined)
              .join("")
              .toLowerCase();

            return rowString.includes(searchQuery);
          }}
        />
      </TableWrapper>
      <RedirectCornerFab
        tooltipTitle="Add User"
        redirectUrl={Routes.ADD_USER}
        Icon={AddIcon}
      />
    </React.Fragment>
  );
};
