import React from "react";
import {
  Hidden,
  useTheme,
  Toolbar,
  IconButton,
  Theme
} from "@material-ui/core";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import { useTranslation } from 'react-i18next';
import { Menu as MenuIcon, Close as CloseIcon, Remove as MinimizeIcon } from "@material-ui/icons";
import { useLocation } from "react-router-dom";
import { MessageChannel } from 'electron-re';
import { red } from "@material-ui/core/colors";

import DrawerMenu, { drawerWidth } from "./DrawerMenu";
import { AdaptiveDrawer } from "./Pices/Drawer";
import { AdaptiveAppBar } from "./Pices/AppBar";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    drawer: {
      [theme.breakpoints.up("sm")]: {
        width: drawerWidth,
        flexShrink: 0
      }
    },
    icons: {
      transition: 'all .2s',
      '&.minimum': {
        backgroundColor: 'rgba(255, 255, 255, .2)',
        '&:hover': {
          transform: 'scale(.8)',
        }
      },
      '&.close': {
        marginLeft: '5px',
        marginRight: '-5px',
        '&:hover': {
          color: red[500]
        }
      }
    },
    disableDrag: {
      '-webkit-app-region': 'none',
    },
    appBar: {
      '-webkit-app-region': 'drag',
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

const minimumApp = () => {
  MessageChannel.invoke('main', 'service:desktop', {
    action: 'minimumApp',
    params: []
  });
};

const hideApp = () => {
  MessageChannel.invoke('main', 'service:desktop', {
    action: 'hideApp',
    params: []
  });
};

const AppNav: React.FC = () => {
  const theme = useTheme();
  const styles = useStyles();
  const { t } = useTranslation();

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
      <AdaptiveAppBar position="fixed" className={styles.appBar}>
        <Toolbar className={styles.toolBar} variant="dense">
          <div className={styles['disableDrag']}>
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
              >
                <MenuIcon className={styles.menuButton} />
              </IconButton>
              <span className={styles.title}>{title}</span>
          </div>
          <span>
            <IconButton
              style={{ padding: 0}}
              color="inherit"
              className={`${styles['disableDrag']} ${styles.icons} minimum`}
              onClick={minimumApp}
            >
              <MinimizeIcon />
            </IconButton>
            <IconButton
              color="inherit"
              style={{ padding: 0}}
              className={`${styles['disableDrag']} ${styles.icons} close`}
              onClick={hideApp}
            >
              <CloseIcon />
            </IconButton>
          </span>
        </Toolbar>
      </AdaptiveAppBar>
      <nav className={styles.drawer}>
        <Hidden smUp implementation="css">
          <AdaptiveDrawer
            variant="temporary"
            anchor={theme.direction === "rtl" ? "right" : "left"}
            open={open}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true
            }}
          >
            <DrawerMenu onClick={handleDrawerToggle} />
          </AdaptiveDrawer>
        </Hidden>
        <Hidden xsDown implementation="css">
          <AdaptiveDrawer variant="permanent" open>
            <DrawerMenu onClick={handleDrawerToggle} />
          </AdaptiveDrawer>
        </Hidden>
      </nav>
    </div>
  );
};

export default AppNav;
