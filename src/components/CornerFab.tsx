/** @jsx jsx */
import { jsx } from "@emotion/core";
import { Tooltip, Fab } from "@material-ui/core";
import { Fragment, FC } from "react";
import { SvgIconComponent } from "@material-ui/icons";

interface Props {
  tooltipTitle?: string;
  onClick: () => void;
  Icon: SvgIconComponent;
}

export const CornerFab: FC<Props> = ({ Icon, tooltipTitle, onClick }) => {
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
        onClick={() => onClick()}
      >
        <Icon />
      </Fab>
    </TooltipComponent>
  );
};
