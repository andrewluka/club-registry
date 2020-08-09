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

export const Games = () => {
  const theme = useTheme();
  const { data: rows } = useGames();
  const { generateQrCodes } = useQrCodeFilesGenerator();
  const { prompt } = usePromptDialog();
  const { data: options } = useTags();

  const gamesToLookupObj = (games: Game[]) => {
    const map = new Map<number, boolean>();

    for (let i = 0; i < games.length; ++i) {
      map.set(games[i].game_id, false);
    }

    return map;
  };

  const [chipsStates, setChipsStates] = useState(gamesToLookupObj(rows));

  const is_suspendedFilterListRenderer = (value: any) =>
    value ? "Suspended" : "Not Suspended";

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
        customFilterListOptions: {
          render: is_suspendedFilterListRenderer,
        },
        filterOptions: {
          renderValue: is_suspendedFilterListRenderer,
        },
      },
    },
    {
      name: "tags",
      label: "Tags",
      options: {
        filter: false,
        customBodyRender: (
          tagsString: string | null,
          tableMeta,
          updateValue
        ) => {
          const game_id: GameID = tableMeta.rowData[0];
          const tags =
            tagsString?.split(GAMES_TAGS_DELIMITER).filter(Boolean) || [];

          const updateTags = (newTags: string[]) => {
            updateGameTags({
              game_id,
              newTags,
            });
            updateValue(newTags.join(GAMES_TAGS_DELIMITER));
          };

          const AddTagButton = () => {
            return (
              <Tooltip title="Add tag">
                <IconButton
                  onClick={async () => {
                    const newTags = await prompt<string[]>({
                      title: "Add a new Tag?",
                      content: "",
                      InputComponent: ({ onChange, value }) => {
                        const tagIsNotAlreadyThere = (tag: string) =>
                          !tags.includes(tag);

                        const handleOnChange = (_: any, tags: string[]) => {
                          onChange(tags.filter(tagIsNotAlreadyThere));
                        };

                        return (
                          <TagsAutoComplete
                            onChange={handleOnChange}
                            onAdd={handleOnChange}
                            selectedTags={value || []}
                            options={options.filter(tagIsNotAlreadyThere)}
                          />
                        );
                      },
                    });

                    if (!newTags) return;

                    updateTags([...tags, ...newTags]);
                  }}
                  size="small"
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
            );
          };

          const TagChip = ({ label }: { label: string }) => (
            <Chip
              onDelete={() => {
                const newTags = tags.filter((tag) => tag !== label);
                updateTags(newTags);
              }}
              css={{ margin: 1 }}
              label={label}
            />
          );

          const TagsComponent = () => {
            if (tags.length <= 0) return <AddTagButton />;

            return chipsStates.get(game_id) ? (
              <Fragment>
                {tags.map((tag) => (
                  <TagChip key={tag} label={tag} />
                ))}
                <AddTagButton />
              </Fragment>
            ) : (
              <Fragment>
                <TagChip label={tags[0]} />
                {tags.length > 1 ? (
                  <span
                    onClick={() => {
                      const newState = new Map(chipsStates);
                      newState.set(game_id, true);

                      setChipsStates(newState);
                    }}
                    css={{ cursor: "pointer" }}
                  >
                    {" +"}
                    {String(tags.length - 1)}
                  </span>
                ) : (
                  <AddTagButton />
                )}
              </Fragment>
            );
          };

          return <TagsComponent />;
        },
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
        // viewColumns: false,
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
