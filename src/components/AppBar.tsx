/** @jsx jsx */
import { jsx } from "@emotion/core";
import { useTheme as useMuiTheme } from "@material-ui/core/styles";
import BackArrowIcon from "@material-ui/icons/ArrowBack";
import { useHistory } from "react-router-dom";
import {
  Typography,
  IconButton,
  Toolbar,
  AppBar as MuiAppBar,
} from "@material-ui/core";
import { Routes } from "../constants/routes";
import { APP_BAR_HEIGHT } from "../constants/ui";

interface BaseProps {
  title: string;
}

interface PropsWithBackButton extends BaseProps {
  backButton: boolean;
  backButtonRoute?: Routes;
}

type Props = BaseProps | PropsWithBackButton;

export const AppBar = (props: Props) => {
  const { title } = props;
  const backButton = (props as any).backButton ?? false;
  const backButtonRoute = (props as any).backButtonRoute;
  const history = useHistory();

  const muiTheme = useMuiTheme();

  return (
    <MuiAppBar
      position="fixed"
      css={{
        display: "flex",
        flex: 1,
        justifyContent: "center",
        alignItems: "stretch",
        height: APP_BAR_HEIGHT,
        zIndex: muiTheme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        {backButton && history.length && (
          <IconButton
            color="default"
            onClick={() =>
              backButtonRoute
                ? history.replace(backButtonRoute)
                : history.goBack()
            }
          >
            <BackArrowIcon />
          </IconButton>
        )}
        <Typography
          css={{
            // color: emotionTheme.appBarTextColor,
            fontWeight: 300,
            position: "relative",
            left: backButton ? 5 : 30,
          }}
          component="h3"
          variant="h6"
        >
          {title}
        </Typography>
      </Toolbar>
    </MuiAppBar>
  );
};
