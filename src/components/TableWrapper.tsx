/** @jsx jsx */
import { jsx } from "@emotion/core";
import { useTheme } from "emotion-theming";
import { Theme } from "../../typings/theme";
import { Props } from "react";

export const TableWrapper = ({ children }: Props<{}>) => {
  const theme = useTheme<Theme>();
  const contentOffset = 20;

  return (
    <div
      css={{
        width: `calc(100vw - ${theme.drawerWidth + contentOffset * 2}px)`,
        height: `calc(100vh - ${theme.appBarHeight + contentOffset * 2}px)`,
        position: "relative",
        left: theme.drawerWidth + contentOffset,
        top: theme.appBarHeight + contentOffset,
      }}
    >
      {children}
    </div>
  );
};
