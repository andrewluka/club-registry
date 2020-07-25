/** @jsx jsx */
import { jsx } from "@emotion/core";
import React from "react";
import MUIDataTable, { MUIDataTableColumnDef } from "mui-datatables";
import { getBorrowersAndGames } from "../services/tablesServices";
import BorrowGameIcon from "@material-ui/icons/Games";
import { Checkbox } from "@material-ui/core";
import { useTheme as useEmotionTheme } from "emotion-theming";
import { Theme } from "../../typings/theme";
import { AppBar } from "../components/AppBar";
import { Drawer } from "../components/Drawer";
import { TableWrapper } from "../components/TableWrapper";
import { Routes } from "../routes";
import { RedirectCornerFab } from "../components/RedirectCornerFab";

export const Home = () => {
  const theme = useEmotionTheme<Theme>();

  const rowsData = getBorrowersAndGames();

  const columns: MUIDataTableColumnDef[] = [
    { label: "User ID", name: "user_id" },
    { label: "User's name", name: "user_name" },
    { label: "Game ID", name: "game_id" },
    { label: "Game borrowed", name: "game_name" },
  ];

  return (
    <React.Fragment>
      <AppBar title="Home" />
      <Drawer />
      <TableWrapper>
        <MUIDataTable
          title="Games borrowed"
          columns={columns}
          data={rowsData}
        />
        <RedirectCornerFab
          tooltipTitle="Borrow game"
          redirectUrl={Routes.BORROW_GAME}
          Icon={BorrowGameIcon}
        />
      </TableWrapper>
    </React.Fragment>
  );
};
