/** @jsx jsx */
import { jsx } from "@emotion/core";
import { useTheme as useEmotionTheme } from "emotion-theming";
import { Theme } from "../../typings/theme";
import { useTheme as useMuiTheme } from "@material-ui/core/styles";
import BackArrowIcon from "@material-ui/icons/ArrowBack";
import { useHistory } from "react-router-dom";
import {
  Typography,
  IconButton,
  Toolbar,
  AppBar as MuiAppBar,
} from "@material-ui/core";
import { Routes } from "../routes";

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

  const emotionTheme = useEmotionTheme<Theme>();
  const muiTheme = useMuiTheme();

  // console.log(muiTheme);

  return (
    <MuiAppBar
      position="fixed"
      css={{
        backgroundColor: emotionTheme.appBarColor,
        // width: "100vw",
        display: "flex",
        flex: 1,
        justifyContent: "center",
        alignItems: "stretch",
        height: emotionTheme.appBarHeight,
        zIndex: muiTheme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        {backButton && history.length && (
          <IconButton
            onClick={() =>
              backButtonRoute
                ? history.replace(backButtonRoute)
                : history.goBack()
            }
          >
            <BackArrowIcon style={{ fill: emotionTheme.appBarTextColor }} />
          </IconButton>
        )}
        <Typography
          css={{
            color: emotionTheme.appBarTextColor,
            fontFamily: emotionTheme.fontFamily,
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
