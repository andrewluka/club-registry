/** @jsx jsx */
import { jsx } from "@emotion/core";
import { AppBar } from "../components/AppBar";
import { Fragment } from "react";
import { Drawer } from "../components/Drawer";
import { ContentWrapper } from "../components/ContentWrapper";
import { CurrentSessionData } from "../components/CurrentSessionData";

export const Statistics = () => {
  return (
    <Fragment>
      <AppBar title="Statistics" />
      <Drawer />
      <ContentWrapper>
        <CurrentSessionData />
      </ContentWrapper>
    </Fragment>
  );
};
