import React from "react";
import clsx from 'clsx';
import {
  useTheme,
  Toolbar,
  IconButton,
  LinearProgress
} from "@material-ui/core";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import { Menu as MenuIcon, Close as CloseIcon, Remove as MinimizeIcon } from "@material-ui/icons";
import { MessageChannel } from 'electron-re';
import { red } from "@material-ui/core/colors";

import DrawerMenu from "../DrawerMenu";
import { AdaptiveDrawer } from "../Pices/Drawer";
import { AdaptiveAppBar } from "../Pices/AppBar";
import { useTypedSelector } from "../../redux/reducers";
import If from "../HOC/IF";

export type AppNavNormalProps = {
  title: string | React.ReactElement;
}

const useStyles = makeStyles(() =>
  createStyles({
    appNavWrapper: {

    },
    drawer: {
      // [theme.breakpoints.up("sm")]: {
      //   width: drawerWidth,
      //   flexShrink: 0
      // }
    },
    visibilityHidden: {
      visibility: "hidden"
    },
    icons: {
      transition: 'all .2s',
      '&.minimum': {
        backgroundColor: 'rgba(255, 255, 255, .2)',
        '&:hover': {
          transform: 'scale(1.1)',
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
      // [theme.breakpoints.up("sm")]: {
      //   width: `calc(100% - ${drawerWidth}px)`,
      //   marginLeft: drawerWidth
      // }
    },
    toolBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      minHeight: '36px'
    },
    menuButton: {
      //   [theme.breakpoints.up("sm")]: {
      //   display: "none"
      // }
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

const AppNavNormal: React.FC<AppNavNormalProps> = (props) => {
  const theme = useTheme();
  const styles = useStyles();
  const { title } = props;
  const settings = useTypedSelector(state => state.settings);
  const status = useTypedSelector(state => state.status);

  const [open, setOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  return (
    <div className={styles.appNavWrapper}>
      <AdaptiveAppBar position="fixed" className={styles.appBar}>
        <Toolbar className={styles.toolBar} variant="dense">
          <div className={styles['disableDrag']}>
            <If
              condition={!settings.fixedMenu}
              then={
                <IconButton
                  color="inherit"
                  edge="start"
                  onClick={handleDrawerToggle}
                >
                  <MenuIcon className={styles.menuButton} />
                </IconButton>
              }
              else={null}
            />
            <span className={styles.title}>{title}</span>
          </div>
          <span>
            <IconButton
              style={{ padding: 0 }}
              color="inherit"
              className={`${styles['disableDrag']} ${styles.icons} minimum`}
              onClick={minimumApp}
            >
              <MinimizeIcon />
            </IconButton>
            <IconButton
              color="inherit"
              style={{ padding: 0 }}
              className={`${styles['disableDrag']} ${styles.icons} close`}
              onClick={hideApp}
            >
              <CloseIcon />
            </IconButton>
          </span>
        </Toolbar>
        <LinearProgress className={clsx(!status.waiting ? styles.visibilityHidden : '')} />
      </AdaptiveAppBar>
      <nav className={styles.drawer}>
          <AdaptiveDrawer
            mode={settings.fixedMenu ? 'absolute' : 'fixed'}
            anchor={theme.direction === "rtl" ? "right" : "left"}
            open={open}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true
            }}
          >
            <DrawerMenu hideIcon={settings.fixedMenu} onClick={handleDrawerToggle} />
          </AdaptiveDrawer>
      </nav>
    </div>
  );
};

export default AppNavNormal;
