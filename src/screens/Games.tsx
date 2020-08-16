/** @jsx jsx */
import { Fragment, useState } from "react";
import { jsx } from "@emotion/core";
import { AppBar } from "../components/AppBar";
import { Drawer } from "../components/Drawer";
import { ContentWrapper } from "../components/ContentWrapper";
import { CornerFab } from "../components/CornerFab";
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
import { getMUIDatatableCheckboxRenderer } from "../components/getMUIDatatableCheckboxRenderer";
import { useGames } from "../hooks/useGames";
import { getMUIDatatableEditableRenderer } from "../components/getMUIDatatableEditableRenderer";
import { getMUIDatatableQRCodeRenderer } from "../components/getMUIDatatableQRCodeRenderer";
import { DataTable, DataTableColumnDef } from "../components/DataTable";
import { useQrCodeFilesGenerator } from "../hooks/useQrCodeFilesGenerator";
import { useTheme } from "@material-ui/core/styles";
import { Game } from "../typings/game";
import { useTags } from "../hooks/useTags";
import { getDataTableIsSuspendedOptions } from "../utils/getDataTableIsSuspendedOptions";
import { getMUIDatatableGameTagsRenderer } from "../components/getMUIDatatableGameTagsRenderer";
import { getDataTableFilterTagsOptions } from "../utils/getDataTableFilterTagsOptions";
import { getDateOfAdditionColumnDef } from "../utils/getDateOfAdditionColumnDef";
import { getDateSearcher } from "../utils/getDateSearcher";
import { useHistory } from "react-router-dom";
import { CurrentSessionData } from "../components/CurrentSessionData";

export const Games = () => {
  const theme = useTheme();
  const history = useHistory();
  const { data: rows } = useGames();
  const { generateQrCodes } = useQrCodeFilesGenerator();
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
          get: (id) => {
            const { payload, isError } = getGame(id);

            if (isError) return { payload: payload, isError } as any;

            return {
              isError: false,
              payload: String(payload?.name || ""),
            };
          },
        }),
        filter: false,
      },
    },
    {
      name: "is_suspended",
      label: "Suspended?",
      options: {
        customBodyRender: getMUIDatatableCheckboxRenderer({
          check: suspendGame,
          uncheck: unsuspendGame,
        }),
        ...getDataTableIsSuspendedOptions(),
      },
    },
    getDateOfAdditionColumnDef({
      extractDate: ({ date_of_addition }) => date_of_addition,
      rows,
    }),
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
      <ContentWrapper>
        <CurrentSessionData />
        <DataTable
          remove={removeGame}
          getRowId={({ game_id }) => game_id}
          title="Games"
          columns={columns}
          rows={rows}
          customSearch={getDateSearcher({
            namesOfColumnsWithDates: ["date_of_addition"],
          })}
        />
      </ContentWrapper>
      <CornerFab
        onClick={() => history.push(Routes.ADD_GAME)}
        tooltipTitle="Add Game"
        Icon={AddIcon}
      />
    </Fragment>
  );
};
