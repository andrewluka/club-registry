/** @jsx jsx */
import { jsx } from "@emotion/core";
import { FC } from "react";
import { DRAWER_WIDTH, APP_BAR_HEIGHT } from "../constants/ui";

export const TableWrapper: FC = ({ children }) => {
  const contentOffset = 20;

  return (
    <div
      css={{
        width: `calc(100vw - ${DRAWER_WIDTH + contentOffset * 2}px)`,
        height: `calc(100vh - ${APP_BAR_HEIGHT + contentOffset * 2}px)`,
        position: "relative",
        left: DRAWER_WIDTH + contentOffset,
        top: APP_BAR_HEIGHT + contentOffset,
        overflow: "auto",
      }}
    >
      {children}
    </div>
  );
};
