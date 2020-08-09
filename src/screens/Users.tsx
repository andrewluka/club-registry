import React from "react";
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
} from "../services/usersServices";
import { getMUIDatatableEditableRenderer } from "../components/getMUIDatatableEditableRenderer";
import { getMUIDatatableIsSuspendedRenderer } from "../components/getMUIDatatableIsSuspendedRenderer";
import { RedirectCornerFab } from "../components/RedirectCornerFab";
import { Routes } from "../constants/routes";
import AddIcon from "@material-ui/icons/Add";
import { getMUIDatatableQRCodeRenderer } from "../components/getMUIDatatableQRCodeRenderer";
import moment from "moment";
import { useQrCodeFilesGenerator } from "../hooks/useQrCodeFilesGenerator";
import { DATE_FORMAT } from "../constants/dates";
import { useTheme } from "@material-ui/core/styles";

export const Users = () => {
  const { data: rows } = useUsers();
  const { generateQrCodes } = useQrCodeFilesGenerator();

  const theme = useTheme();

  const columns: DataTableColumnDef[] = [
    { label: "ID", name: "user_id" },
    {
      name: "name",
      label: "Name",
      options: {
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
        customBodyRenderLite: (dataIndex) => {
          const date_of_birth = rows[dataIndex].date_of_birth;

          return typeof date_of_birth === "number"
            ? moment(date_of_birth).format(DATE_FORMAT)
            : "";
        },
      },
    },
    {
      label: "Phone number",
      name: "phone_number",
    },
    {
      name: "is_suspended",
      label: "Suspended?",
      options: {
        customBodyRender: getMUIDatatableIsSuspendedRenderer({
          suspend: suspendUser,
          unsuspend: unsuspendUser,
        }),
      },
    },
    {
      name: "game_id",
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
