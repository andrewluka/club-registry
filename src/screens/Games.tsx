/** @jsx jsx */
import { Fragment } from "react";
import { jsx } from "@emotion/core";
import { AppBar } from "../components/AppBar";
import { Drawer } from "../components/Drawer";
import { TableWrapper } from "../components/TableWrapper";
import MUIDataTable, { MUIDataTableColumnDef } from "mui-datatables";
import { RedirectCornerFab } from "../components/RedirectCornerFab";
import { Routes } from "../routes";
import AddIcon from "@material-ui/icons/Add";
import {
  getAllGames,
  suspendGame,
  unsuspendGame,
  removeGame,
} from "../services/tablesServices";
import { getMUIDatatableIsSuspendedRenderer } from "../services/getMUIDatatableIsSuspendedRenderer";
import { useErrorSnackbar } from "../hooks/useErrorSnackbar";

export const Games = () => {
  const { enqueueErrorSnackbar } = useErrorSnackbar();
  const rows = getAllGames();

  const is_suspendedRenderer = getMUIDatatableIsSuspendedRenderer({
    suspend: suspendGame,
    unsuspend: unsuspendGame,
    enqueueErrorSnackbar,
  });

  const columns: MUIDataTableColumnDef[] = [
    { name: "game_id", label: "ID" },
    { name: "name", label: "Name" },
    {
      name: "is_suspended",
      label: "Suspended?",
      options: { customBodyRender: is_suspendedRenderer },
    },
  ];

  return (
    <Fragment>
      <AppBar title="Games" />
      <Drawer />
      <TableWrapper>
        <MUIDataTable
          options={{
            selectableRows: "single",
            onRowsDelete: ({ data: rowsToDelete }) => {
              const game_id = rows[rowsToDelete[0].index].game_id;
              const isDeleteSuccessful = removeGame(game_id);

              if (!isDeleteSuccessful) {
                enqueueErrorSnackbar();
                return false;
              } else {
              }
            },
          }}
          title="Games"
          columns={columns}
          data={rows}
        />
      </TableWrapper>
      <RedirectCornerFab
        redirectUrl={Routes.ADD_GAME}
        tooltipTitle="Add Game"
        Icon={AddIcon}
      />
    </Fragment>
  );
};
