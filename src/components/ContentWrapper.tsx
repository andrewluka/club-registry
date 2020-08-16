/** @jsx jsx */
import { jsx } from "@emotion/core";
import { FC } from "react";
import { DRAWER_WIDTH, APP_BAR_HEIGHT } from "../constants/ui";

export const ContentWrapper: FC = ({ children }) => {
  const contentOffset = 10;

  return (
    <div
      css={{
        width: `calc(100vw - ${DRAWER_WIDTH}px)`,
        height: `calc(100vh - ${APP_BAR_HEIGHT}px)`,
        position: "relative",
        left: DRAWER_WIDTH,
        top: APP_BAR_HEIGHT,
        "> *": {
          margin: contentOffset,
        },
      }}
    >
      {children}
    </div>
  );
};
