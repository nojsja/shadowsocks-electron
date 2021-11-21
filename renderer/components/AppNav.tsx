import React from "react";
import {
  Drawer,
  Hidden,
  useTheme,
  AppBar,
  Toolbar,
  IconButton,
  Theme
} from "@material-ui/core";
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import { makeStyles, createStyles, withStyles } from "@material-ui/core/styles";
import { useTranslation } from 'react-i18next';
import MenuIcon from "@material-ui/icons/Menu";
import { useHistory, useLocation } from "react-router-dom";
import DrawerMenu, { drawerWidth } from "./DrawerMenu";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    drawer: {
      [theme.breakpoints.up("sm")]: {
        width: drawerWidth,
        flexShrink: 0
      }
    },
    appBar: {
      [theme.breakpoints.up("sm")]: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: drawerWidth
      }
    },
    toolBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    menuButton: {
        [theme.breakpoints.up("sm")]: {
        display: "none"
      }
    },
    title: {
      fontWeight: 'bold'
    }
  })
);

const StyledDrawer = withStyles({
  paper: {
    width: drawerWidth
  }
})(Drawer);

const AppNav: React.FC = () => {
  const theme = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();
  const history = useHistory();

  const [open, setOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };
  const titleMap = new Map([
    ['home', t('home')],
    ['settings', t('settings')],
    ['about', t('about')]
  ]);

  const location = useLocation();
  const path = location.pathname.split("/")[1];
  const title = titleMap.get(path);

  return (
    <div>
      <AppBar position="fixed" className={styles.appBar}>
        <Toolbar className={styles.toolBar} variant="dense">
          <div>
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
              >
                <MenuIcon className={styles.menuButton} />
              </IconButton>
              <span className={styles.title}>{title}</span>
          </div>
          <IconButton
            color="inherit"
            onClick={() => history.goBack()}
          >
            <ChevronLeftIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <nav className={styles.drawer}>
        <Hidden smUp implementation="css">
          <StyledDrawer
            variant="temporary"
            anchor={theme.direction === "rtl" ? "right" : "left"}
            open={open}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true
            }}
          >
            <DrawerMenu onClick={handleDrawerToggle} />
          </StyledDrawer>
        </Hidden>
        <Hidden xsDown implementation="css">
          <StyledDrawer variant="permanent" open>
            <DrawerMenu onClick={handleDrawerToggle} />
          </StyledDrawer>
        </Hidden>
      </nav>
    </div>
  );
};

export default AppNav;
