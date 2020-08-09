/** @jsx jsx */
import { jsx } from "@emotion/core";
import { Tooltip, Fab } from "@material-ui/core";
import { Fragment, FC } from "react";
import { useHistory } from "react-router-dom";
import { SvgIconComponent } from "@material-ui/icons";
import { Routes } from "../constants/routes";

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
        <Icon />
      </Fab>
    </TooltipComponent>
  );
};
