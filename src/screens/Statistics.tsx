/** @jsx jsx */
import { jsx } from "@emotion/core";
import { AppBar } from "../components/AppBar";
import { Fragment } from "react";
import { Drawer } from "../components/Drawer";
import { TableWrapper } from "../components/TableWrapper";

export const Statistics = () => {
  return (
    <Fragment>
      <AppBar title="Statistics" />
      <Drawer />
      <TableWrapper />
    </Fragment>
  );
};
