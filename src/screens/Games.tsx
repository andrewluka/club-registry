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
  suspendGame,
  unsuspendGame,
  removeGame,
  updateGameName,
  getGame,
} from "../services/tablesServices";
import { getMUIDatatableIsSuspendedRenderer } from "../components/getMUIDatatableIsSuspendedRenderer";
import { useErrorSnackbar } from "../hooks/useErrorSnackbar";
import { useSuccessSnackbar } from "../hooks/useSuccessSnackbar";
import { useGames } from "../hooks/useGames";
import { getMUIDatatableEditableRenderer } from "../components/getMUIDatatableEditableRenderer";
import { getMUIDatatableQRCodeRenderer } from "../components/getMUIDatatableQRCodeRenderer";
import { useTheme } from "emotion-theming";
import { Theme } from "../../typings/theme";
import { useDismissableSnackbar } from "../hooks/useDismissableSnackbar";

export const Games = () => {
  const { enqueueErrorSnackbar } = useErrorSnackbar();
  const { enqueueSuccessSnackbar } = useSuccessSnackbar();
  const { enqueueDismissableSnackbar } = useDismissableSnackbar();
  const theme = useTheme<Theme>();
  const rows = useGames();

  const is_suspendedRenderer = getMUIDatatableIsSuspendedRenderer({
    suspend: suspendGame,
    unsuspend: unsuspendGame,
    enqueueErrorSnackbar,
  });

  const columns: MUIDataTableColumnDef[] = [
    { name: "game_id", label: "ID" },
    {
      name: "name",
      label: "Name",
      options: {
        customBodyRender: getMUIDatatableEditableRenderer({
          theme,
          validateInput: () => true,
          update: ({ id, newValue }) =>
            updateGameName({ game_id: id, newName: newValue }),
          get: (id) => getGame(id).name,
          enqueueErrorSnackbar,
          enqueueSuccessSnackbar,
        }),
      },
    },
    {
      name: "is_suspended",
      label: "Suspended?",
      options: { customBodyRender: is_suspendedRenderer },
    },
    {
      name: "game_id",
      label: " ",
      options: {
        filter: false,
        sort: false,
        customBodyRender: getMUIDatatableQRCodeRenderer({
          enqueueDismissableSnackbar,
        }),
      },
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
                enqueueSuccessSnackbar();
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
