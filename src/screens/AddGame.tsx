/** @jsx jsx */
import { jsx, css } from "@emotion/core";
import { Fragment, useState } from "react";
import { AppBar } from "../components/AppBar";
import { QRScannerTextField } from "../components/QRScannerTextField";
import { Button } from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import { addGame } from "../services/gamesServices";
import { useErrorSnackbar } from "../hooks/useErrorSnackbar";
import { useSuccessSnackbar } from "../hooks/useSuccessSnackbar";
import { Routes } from "../constants/routes";
import { useHistory } from "react-router-dom";
import { useConfirmDialog } from "../hooks/useConfirmDialog";
import { TagsAutoComplete } from "../components/TagsAutoComplete";
import { useTags } from "../hooks/useTags";
import { GAMES_TAGS_DELIMITER } from "../constants/tables";

const centerChildStyles = css({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

export const AddGame = () => {
  const history = useHistory();
  const muiTheme = useTheme();

  const { enqueueErrorSnackbar } = useErrorSnackbar();
  const { enqueueSuccessSnackbar } = useSuccessSnackbar();
  const { confirm } = useConfirmDialog();
  const { data: options } = useTags();

  const [gameName, setGameName] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const onSubmit = async () => {
    if (!gameName.trim()) {
      enqueueErrorSnackbar({ errorMessage: "Invalid game name" });
      return;
    }

    const undefinedElement = <span css={{ opacity: 0.7 }}>null</span>;

    const shouldCreateGame = await confirm({
      title: "Are you sure?",
      content: (
        <Fragment>
          A new game with the following fields will be created:
          <ul>
            <li>name: {gameName}</li>
            <li>
              tags:{" "}
              {tags.length > 0
                ? tags.map((tag, index) => (
                    <Fragment key={tag}>
                      <span css={{ color: muiTheme.palette.primary.main }}>
                        {tag}
                      </span>
                      {index !== tags.length - 1 && ", "}
                    </Fragment>
                  ))
                : undefinedElement}
            </li>
          </ul>
        </Fragment>
      ),
    });

    if (!shouldCreateGame) return;

    const wasOperationSuccessful = addGame({ name: gameName, tags });

    if (wasOperationSuccessful) {
      history.push(Routes.GAMES);
      enqueueSuccessSnackbar({ successMessage: "Added game" });
    } else {
      enqueueErrorSnackbar({ errorMessage: "Failed to add game" });
    }
  };

  const tagsFilterer = (tags: string[]) =>
    tags
      .map((str) => str.trim())
      .filter((e) => Boolean(e) && !e.includes(GAMES_TAGS_DELIMITER));

  return (
    <Fragment>
      <AppBar title="Add Game" backButton backButtonRoute={Routes.GAMES} />

      <div
        css={{
          width: "100vw",
          height: "100vh",
          display: "grid",
          gridGap: "10px",
          gridTemplateRows: "2fr 1fr",
          gridTemplateColumns: "repeat(2, 1fr)",
        }}
      >
        <div css={[{ gridColumn: "1", gridRow: "1" }, centerChildStyles]}>
          <QRScannerTextField
            label="Game's name"
            inputMethod="text"
            value={gameName}
            onChange={setGameName}
            required
            helperText="Field must not be empty"
          />
        </div>

        <div css={[{ gridColumn: "2", gridRow: "1" }, centerChildStyles]}>
          <TagsAutoComplete
            label="Tags"
            onChange={(_, tags) => setTags(tagsFilterer(tags))}
            onAdd={(_, tags) => {
              setTags(tagsFilterer(tags));
            }}
            selectedTags={tags}
            options={options}
          />
        </div>

        <div css={[{ gridColumn: "1 / 3", gridRow: "2" }, centerChildStyles]}>
          <Button color="primary" variant="contained" onClick={onSubmit}>
            Submit
          </Button>
        </div>
      </div>
    </Fragment>
  );
};
