/** @jsx jsx */
import { jsx } from "@emotion/core";
import { useTheme } from "emotion-theming";
import { Theme } from "../../typings/theme";
import MuiDrawer from "@material-ui/core/Drawer";
import { SvgIconComponent } from "@material-ui/icons";
import {
  Toolbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom";
import { Routes } from "../routes";
import HomeIcon from "@material-ui/icons/Home";
import UsersIcon from "@material-ui/icons/PeopleAlt";
import GamesIcon from "@material-ui/icons/SportsEsports";

interface PrimaryAction {
  text: string;
  pathToPush: Routes;
  Icon: SvgIconComponent;
}

export const Drawer = () => {
  const primaryActions: PrimaryAction[] = [
    { pathToPush: Routes.HOME, text: "Home", Icon: HomeIcon },
    { pathToPush: Routes.USERS, text: "Users", Icon: UsersIcon },
    { pathToPush: Routes.GAMES, text: "Games", Icon: GamesIcon },
  ];

  const theme = useTheme<Theme>();
  const history = useHistory();

  const useStyles = makeStyles({
    paper: {
      background: theme.drawerBackgroundColor,
      color: theme.drawerTextColor,
      width: theme.drawerWidth,
    },
  });

  const styles = useStyles();

  return (
    <MuiDrawer classes={{ paper: styles.paper }} variant="permanent">
      <Toolbar />
      <div css={{ overflow: "auto" }}>
        <List>
          {primaryActions.map(({ text, pathToPush, Icon }, index) => (
            <ListItem
              onClick={() => {
                const currentPathname = history.location.pathname || "/";

                if (currentPathname !== pathToPush) history.push(pathToPush);
              }}
              button
              key={text}
            >
              <ListItemIcon>
                <Icon style={{ fill: theme.drawerTextColor }} />
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
      </div>
    </MuiDrawer>
  );
};
