/** @jsx jsx */
import { jsx } from "@emotion/core";
import { Tooltip, IconButton, Chip } from "@material-ui/core";
import { GAMES_TAGS_DELIMITER } from "../constants/tables";
import {
  useErrorSnackbar,
  ErrorSnackbarEnqueuer,
} from "../hooks/useErrorSnackbar";
import {
  useSuccessSnackbar,
  SuccessSnackbarEnqueuer,
} from "../hooks/useSuccessSnackbar";
import { usePromptDialog } from "../hooks/usePromptDialog";
import { TagsAutoComplete } from "./TagsAutoComplete";
import AddIcon from "@material-ui/icons/Add";
import { Fragment, useState } from "react";
import { MUIDatatableRenderer } from "../typings/muiDatatable";
import { ErrorWrapper } from "../typings/tables";

interface Options<Row> {
  allGameTags: string[];
  tagChipsStatesMap: Map<number, boolean>;
  updateMapAtId: (id: number, newValue: boolean) => void;
  idIndex?: number;
  update?: (options: { id: number; newTags: string[] }) => ErrorWrapper<void>;
}

type TagsUpdater = (
  newTags: string[],
  enqueueErrorSnackbar: ErrorSnackbarEnqueuer,
  enqueueSuccessSnackbar: SuccessSnackbarEnqueuer
) => void;

export const getMUIDatatableGameTagsRenderer = <Row extends any>({
  allGameTags,
  tagChipsStatesMap,
  updateMapAtId,
  idIndex = 0,
  update,
}: Options<Row>): MUIDatatableRenderer => {
  const AddTagsButton = ({
    tags,
    updateTags,
  }: {
    tags: string[];
    updateTags: TagsUpdater;
  }) => {
    const { enqueueErrorSnackbar } = useErrorSnackbar();
    const { enqueueSuccessSnackbar } = useSuccessSnackbar();
    const { prompt } = usePromptDialog();

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
                    options={allGameTags.filter(tagIsNotAlreadyThere)}
                  />
                );
              },
            });

            if (!newTags) return;

            updateTags(
              [...tags, ...newTags],
              enqueueErrorSnackbar,
              enqueueSuccessSnackbar
            );
          }}
          size="small"
        >
          <AddIcon />
        </IconButton>
      </Tooltip>
    );
  };

  const TagChip = ({
    label,
    tags,
    updateTags,
  }: {
    label: string;
    tags: string[];
    updateTags: TagsUpdater;
  }) => {
    const { enqueueErrorSnackbar } = useErrorSnackbar();
    const { enqueueSuccessSnackbar } = useSuccessSnackbar();

    return (
      <Chip
        onDelete={() => {
          const newTags = tags.filter((tag) => tag !== label);
          updateTags(newTags, enqueueErrorSnackbar, enqueueSuccessSnackbar);
        }}
        css={{ margin: 1 }}
        label={label}
      />
    );
  };

  const TagsComponent = ({
    tags,
    updateTags,
    showAllTags,
    setShowAllTags,
  }: {
    tags: string[];
    updateTags: TagsUpdater;
    showAllTags: boolean;
    setShowAllTags: (newShowAllTags: boolean) => void;
  }) => {
    const AddTagsButtonElement = (
      <AddTagsButton tags={tags} updateTags={updateTags} />
    );

    if (tags.length <= 0) return AddTagsButtonElement;

    return showAllTags ? (
      <Fragment>
        {tags.map((tag) => (
          <TagChip tags={tags} updateTags={updateTags} key={tag} label={tag} />
        ))}
        {AddTagsButtonElement}
      </Fragment>
    ) : (
      <Fragment>
        <TagChip tags={tags} updateTags={updateTags} label={tags[0]} />
        {tags.length > 1 ? (
          <span
            onClick={() => setShowAllTags(true)}
            css={{ cursor: "pointer" }}
          >
            {" +"}
            {String(tags.length - 1)}
          </span>
        ) : (
          AddTagsButtonElement
        )}
      </Fragment>
    );
  };

  return (tagsString: string | undefined, tableMeta) => {
    const tags = tagsString?.split(GAMES_TAGS_DELIMITER).filter(Boolean) || [];
    const id = tableMeta.rowData[idIndex];

    const updateTags = (
      newTags: string[],
      enqueueErrorSnackbar: ErrorSnackbarEnqueuer,
      enqueueSuccessSnackbar: SuccessSnackbarEnqueuer
    ) => {
      const editable = !!update;

      if (!update || !editable) return;

      const { isError, payload } = update({ id, newTags });

      !isError
        ? enqueueSuccessSnackbar({ successMessage: "Updated tags" })
        : enqueueErrorSnackbar({
            errorMessage:
              "Couldn't update tags: " +
              ((payload as any)?.message || payload || ""),
          });
    };

    return (
      <TagsComponent
        showAllTags={!!tagChipsStatesMap.get(id)}
        setShowAllTags={(newValue) => updateMapAtId(id, newValue)}
        tags={tags}
        updateTags={updateTags}
      />
    );
  };
};
