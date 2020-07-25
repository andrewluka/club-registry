export type Color = string;

export interface Theme {
  primaryColor: Color;
  secondaryColor: Color;

  backgroundColor: Color;
  appBarColor: Color;
  appBarTextColor: Color;

  drawerBackgroundColor: Color;
  drawerTextColor: Color;

  disabledColor: Color;
  disabledTextColor: Color;

  primaryTextColor: Color;
  secondaryTextColor: Color;

  fontFamily: string;
  appBarHeight: number;
  drawerWidth: number;

  fabPrimaryIconColor: Color;
  fabSecondaryIconColor: Color;
}
