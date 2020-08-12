/** @jsx jsx */
import { Fragment, useState, CSSProperties } from "react";
import { jsx } from "@emotion/core";
import { AppBar } from "../components/AppBar";
import { Drawer } from "../components/Drawer";
import { TableWrapper } from "../components/TableWrapper";
import { RedirectCornerFab } from "../components/RedirectCornerFab";
import { Routes } from "../constants/routes";
import AddIcon from "@material-ui/icons/Add";
import {
  suspendGame,
  unsuspendGame,
  removeGame,
  updateGameName,
  getGame,
  updateGameTags,
} from "../services/gamesServices";
import { getMUIDatatableIsSuspendedRenderer } from "../components/getMUIDatatableIsSuspendedRenderer";
import { useGames } from "../hooks/useGames";
import { getMUIDatatableEditableRenderer } from "../components/getMUIDatatableEditableRenderer";
import { getMUIDatatableQRCodeRenderer } from "../components/getMUIDatatableQRCodeRenderer";
import { DataTable, DataTableColumnDef } from "../components/DataTable";
import { useQrCodeFilesGenerator } from "../hooks/useQrCodeFilesGenerator";
import { GAMES_TAGS_DELIMITER } from "../constants/tables";
import { useTheme } from "@material-ui/core/styles";
import { Chip, Tooltip, IconButton } from "@material-ui/core";
import { usePromptDialog } from "../hooks/usePromptDialog";
import { Game, GameID } from "../typings/game";
import { TagsAutoComplete } from "../components/TagsAutoComplete";
import { useTags } from "../hooks/useTags";
import { getDataTableIsSuspendedOptions } from "../utils/getDataTableIsSuspendedOptions";
import { getMUIDatatableGameTagsRenderer } from "../components/getMUIDatatableGameTagsRenderer";
import { getDataTableFilterTagsOptions } from "../utils/getDataTableFilterTagsOptions";

export const Games = () => {
  const theme = useTheme();
  const { data: rows } = useGames();
  const { generateQrCodes } = useQrCodeFilesGenerator();
  const { prompt } = usePromptDialog();
  const { data: allGameTags } = useTags();

  const gamesToMap = (games: Game[]) => {
    const map = new Map<number, boolean>();

    for (let i = 0; i < games.length; ++i) {
      map.set(games[i].game_id, false);
    }

    return map;
  };

  const [chipsStates, setChipsStates] = useState(gamesToMap(rows));

  const columns: DataTableColumnDef[] = [
    {
      name: "game_id",
      label: "ID",
      options: {
        filter: false,
      },
    },
    {
      name: "name",
      label: "Name",
      options: {
        customBodyRender: getMUIDatatableEditableRenderer({
          update: ({ id, newValue }) =>
            updateGameName({ game_id: id, newName: newValue }),
          get: (id) => getGame(id)?.name || "",
        }),
        filter: false,
      },
    },
    {
      name: "is_suspended",
      label: "Suspended?",
      options: {
        customBodyRender: getMUIDatatableIsSuspendedRenderer({
          suspend: suspendGame,
          unsuspend: unsuspendGame,
        }),
        ...getDataTableIsSuspendedOptions(),
      },
    },
    {
      name: "tags",
      label: "Tags",
      options: {
        ...getDataTableFilterTagsOptions({
          allGameTags,
        }),
        customBodyRender: getMUIDatatableGameTagsRenderer({
          allGameTags,
          tagChipsStatesMap: chipsStates,
          updateMapAtId: (id, newValue) => {
            setChipsStates((oldMap) => {
              const newMap = new Map(oldMap);
              newMap.set(id, newValue);

              return newMap;
            });
          },
          update: ({ id, newTags }) => updateGameTags({ game_id: id, newTags }),
        }),
      },
    },
    {
      name: "game_id",
      label: "Generate & Download all QR Codes",
      options: {
        filter: false,
        sort: false,
        print: false,
        download: false,
        setCellHeaderProps: () => ({
          onClick: async () => {
            await generateQrCodes({
              values: rows.map(({ game_id, name }) => ({
                data: String(game_id),
                nickname: name,
              })),
            });
          },
          style: {
            color: theme.palette.primary.main,
            cursor: "pointer",
          },
        }),
        customBodyRender: getMUIDatatableQRCodeRenderer(),
      },
    },
  ];

  return (
    <Fragment>
      <AppBar title="Games" />
      <Drawer />
      <TableWrapper>
        <DataTable
          remove={removeGame}
          getRowId={({ game_id }) => game_id}
          title="Games"
          columns={columns}
          rows={rows}
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
