import React, { FC } from "react";
import { SvgIcon, SvgIconProps } from "@material-ui/core";

export const QRCodeIcon: FC<SvgIconProps> = (props) => {
  return (
    // got svg content from: https://iconmonstr.com/qr-code-9-svg/
    // license:https://iconmonstr.com/license/
    <SvgIcon {...props}>
      <path
        xmlns="http://www.w3.org/2000/svg"
        d="M24 13h-24v-3h24v3zm-14-5h1v-2h-2v1h1v1zm2-3h1v-1h-1v-1h-3v1h2v2h1v-1zm2 1h1v-5h-1v1h-1v-1h-4v1h3v1h2v3zm-1 1h1v-1h-1v1zm-10-1h3v-3h-3v3zm15 0h3v-3h-3v3zm-2 2v-7h7v7h-7zm1-1h5v-5h-5v5zm-2 1v-1h-1v1h1zm-3 0h1v-1h-1v1zm-11 0v-7h7v7h-7zm1-1h5v-5h-5v5zm11 13v1h1v-1h-1zm3-4h1v-1h-1v1zm2 3h2v1h-1v2h-1v1h-1v-1h-1v1h-1v-1h-1v-1h1v-2h-2v1h-3v1h1v1h-1v1h-1v-5h1v-1h2v-1h1v-1h1v1h2v1h-1v1h1v1h1v-1h1v1zm-1 1h-1v1h1v-1zm2-5v1h1v-1h-1zm2 0v1h1v-1h-1zm-3 2v-1h-1v1h1zm3 0v-1h-1v1h-1v1h1v1h1v-1h2v-2h-1v1h-1zm-9 6h1v-2h-1v2zm9-2v2h1v-1h1v-2h-1v1h-1zm-20-5h7v7h-7v-7zm1 6h5v-5h-5v5zm18 1v-1h-1v1h1zm-17-2h3v-3h-3v3zm19-1v-1h-1v1h1zm-13-5v2h1v-2h-1z"
      />
    </SvgIcon>
  );
};
