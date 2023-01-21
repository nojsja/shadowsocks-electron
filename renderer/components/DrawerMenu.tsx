import React from "react";
import { useRouteMatch } from 'react-router';
import {
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from "@material-ui/core";
import clsx from "clsx";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import { useTranslation } from  'react-i18next';
import HomeIcon from "@material-ui/icons/Home";
import SettingsIcon from "@material-ui/icons/Settings";
import InfoIcon from "@material-ui/icons/Info";
import DeveloperBoardIcon from '@material-ui/icons/DeveloperBoard';
import { Link } from "react-router-dom";

import banner from '../../assets/banner.png';

const useStyles = makeStyles(theme => createStyles({
  text: {
    color: theme.palette.type === 'dark' ? theme.palette.text.primary : 'black',
  },
  matchHighlight: {
    color: theme.palette.primary.main
  },
  banner: {
    textAlign: 'center',
    width: '100%',
    height: 'auto'
  }
}));

export const drawerWidth = 200;
export interface DrawerMenuProps {
  onClick?: () => void;
  hideIcon?: boolean
}

const DrawerMenu: React.FC<DrawerMenuProps> = props => {
  const { t } = useTranslation();
  const styles = useStyles();
  const { onClick, hideIcon } = props;

  const getMatchedClasses = (matched: boolean) => clsx(styles['text'], matched && styles['matchHighlight']);

  const matchHomePath = getMatchedClasses(!!useRouteMatch('/home'));
  const matchSettingsPath = getMatchedClasses(!!useRouteMatch('/settings'));
  const matchAboutPath = getMatchedClasses(!!useRouteMatch('/about'));
  const matchUserScriptPath = getMatchedClasses(!!useRouteMatch('/user-script'));

  return (
    <>
      { !hideIcon && (
        <>
          <img className={styles.banner} alt="banner" src={banner}></img>
          <Divider />
        </>
        )
      }
      <List>
        <Link to="/home" onClick={onClick}>
          <ListItem button>
            <ListItemIcon className={matchHomePath}>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary={t('home')} className={matchHomePath}/>
          </ListItem>
        </Link>
        <Link to="/settings" onClick={props.onClick}>
          <ListItem button>
            <ListItemIcon className={matchSettingsPath}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary={t('settings')} className={matchSettingsPath}/>
          </ListItem>
        </Link>
        <Link to="/about" onClick={props.onClick} >
          <ListItem button>
            <ListItemIcon className={matchAboutPath}>
              <InfoIcon />
            </ListItemIcon>
            <ListItemText primary={t('about')} className={matchAboutPath} />
          </ListItem>
        </Link>
        <Link to="/user-script" onClick={props.onClick} >
          <ListItem button>
            <ListItemIcon className={matchUserScriptPath}>
              <DeveloperBoardIcon />
            </ListItemIcon>
            <ListItemText primary={t('user_script')} className={matchUserScriptPath} />
          </ListItem>
        </Link>
      </List>
    </>
  );
};

export default DrawerMenu;
