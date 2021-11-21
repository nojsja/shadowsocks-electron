import React from "react";
import {
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from "@material-ui/core";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import { useTranslation } from  'react-i18next';
import HomeIcon from "@material-ui/icons/Home";
import SettingsIcon from "@material-ui/icons/Settings";
import InfoIcon from "@material-ui/icons/Info";
import { Link } from "react-router-dom";

import banner from '../../assets/banner.png';

const useStyles = makeStyles(theme => createStyles({
  banner: {
    textAlign: 'center',
    width: '100%',
    height: 'auto'
  }
}));

export const drawerWidth = 200;
export interface DrawerMenuProps {
  onClick?: () => void;
}

const DrawerMenu: React.FC<DrawerMenuProps> = props => {
  const { t } = useTranslation();
  const styles = useStyles();

  return (
    <>
      <img className={styles.banner} src={banner}></img>
      <Divider />
      <List>
        <Link to="/home" onClick={props.onClick}>
          <ListItem button>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary={t('home')} />
          </ListItem>
        </Link>
        <Link to="/settings" onClick={props.onClick}>
          <ListItem button>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary={t('settings')} />
          </ListItem>
        </Link>
        <Link to="/about" onClick={props.onClick}>
          <ListItem button>
            <ListItemIcon>
              <InfoIcon />
            </ListItemIcon>
            <ListItemText primary={t('about')} />
          </ListItem>
        </Link>
      </List>
    </>
  );
};

export default DrawerMenu;
