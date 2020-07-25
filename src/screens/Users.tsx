import React from "react";
import MUIDataTable, { MUIDataTableColumnDef } from "mui-datatables";
import { Drawer } from "../components/Drawer";
// import { useTheme } from "emotion-theming";
// import { Theme } from "../../typings/theme";
import { AppBar } from "../components/AppBar";
import { TableWrapper } from "../components/TableWrapper";
import { getAllUsers } from "../services/tablesServices";

export const Users = () => {
  // const theme = useTheme<Theme>();

  const columns: MUIDataTableColumnDef[] = [
    { label: "ID", name: "user_id" },
    { name: "name", label: "Name" },
    { label: "Date of Birth", name: "date_of_birth" },
    { label: "Phone number", name: "phone_number" },
  ];

  const rows = getAllUsers().map(
    ({ user_id, name, date_of_birth, phone_number, is_suspended }) => ({
      user_id,
      name,
      date_of_birth:
        typeof date_of_birth === "number"
          ? new Date(date_of_birth).toDateString()
          : "",
      phone_number: phone_number || "",
      is_suspended,
    })
  );

  return (
    <React.Fragment>
      <Drawer />
      <AppBar title="Users" />
      <TableWrapper>
        <MUIDataTable title="Users" columns={columns} data={rows} />
      </TableWrapper>
    </React.Fragment>
  );
};
