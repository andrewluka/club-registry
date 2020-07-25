/** @jsx jsx */
import { jsx } from "@emotion/core";
import { useTheme as useEmotionTheme } from "emotion-theming";
import { Tooltip, Fab, createMuiTheme } from "@material-ui/core";
import { ThemeProvider as MuiThemeProvider } from "@material-ui/core/styles";
import { Fragment, FC } from "react";
import { useHistory } from "react-router-dom";
import { SvgIconComponent } from "@material-ui/icons";
import { Theme } from "../../typings/theme";
import { Routes } from "../routes";

interface Props {
  tooltipTitle?: string;
  redirectUrl: Routes;
  Icon: SvgIconComponent;
}

export const RedirectCornerFab: FC<Props> = ({
  Icon,
  tooltipTitle,
  redirectUrl,
}) => {
  const history = useHistory();
  const TooltipComponent = tooltipTitle ? Tooltip : Fragment;

  const theme = useEmotionTheme<Theme>();

  return (
    <TooltipComponent title={tooltipTitle || ""} arrow>
      <Fab
        css={{
          position: "fixed",
          bottom: 20,
          right: 20,
        }}
        color="primary"
        onClick={() => history.push(redirectUrl)}
      >
        <Icon style={{ fill: theme.fabPrimaryIconColor }} />
      </Fab>
    </TooltipComponent>
  );
};
