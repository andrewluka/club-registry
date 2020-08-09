/** @jsx jsx */
import { jsx } from "@emotion/core";
import React from "react";
import BorrowGameIcon from "@material-ui/icons/Games";
import { AppBar } from "../components/AppBar";
import { Drawer } from "../components/Drawer";
import { TableWrapper } from "../components/TableWrapper";
import { Routes, ReturnGameQueryParams } from "../constants/routes";
import { RedirectCornerFab } from "../components/RedirectCornerFab";
import { useBorrowersAndGames } from "../hooks/useBorrowersAndGames";
import { IconButton, Tooltip } from "@material-ui/core";
import ReturnIcon from "@material-ui/icons/Replay";
import { useHistory } from "react-router-dom";
import { DataTable, DataTableColumnDef } from "../components/DataTable";

export const Home = () => {
  const { data: rows } = useBorrowersAndGames();
  const history = useHistory();

  const columns: DataTableColumnDef[] = [
    { label: "User ID", name: "user_id" },
    { label: "User's name", name: "user_name" },
    { label: "Game ID", name: "game_id" },
    { label: "Game borrowed", name: "game_name" },
    {
      name: "",
      options: {
        sort: false,
        filter: false,
        customBodyRenderLite: (dataIndex) => (
          <Tooltip title="Return game">
            <IconButton
              color="secondary"
              onClick={() => {
                const { game_id, user_id } = rows[dataIndex];
                const userParam = `${ReturnGameQueryParams.user_id}=${user_id}`;
                const gameParam = `${ReturnGameQueryParams.game_id}=${game_id}`;

                const queryParams = `${gameParam}&${userParam}`;

                history.push(`${Routes.RETURN_GAME_BASE}?${queryParams}`);
              }}
            >
              <ReturnIcon />
            </IconButton>
          </Tooltip>
        ),
      },
    },
  ];

  return (
    <React.Fragment>
      <AppBar title="Home" />
      <Drawer />
      <TableWrapper>
        <DataTable title="Games borrowed" columns={columns} rows={rows} />
        <RedirectCornerFab
          tooltipTitle="Borrow game"
          redirectUrl={Routes.BORROW_GAME}
          Icon={BorrowGameIcon}
        />
      </TableWrapper>
    </React.Fragment>
  );
};
