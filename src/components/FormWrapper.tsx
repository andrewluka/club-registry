/** @jsx jsx */
import { FC } from "react";
import { jsx } from "@emotion/core";

export const FormWrapper: FC = ({ children }) => (
  <div
    css={{
      width: "100vw",
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-evenly",
      flexDirection: "column",
    }}
  >
    {children}
  </div>
);
