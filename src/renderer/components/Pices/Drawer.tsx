import React from 'react';
import { withStyles, makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Drawer, DrawerProps }  from '@material-ui/core';
import { drawerWidth } from '../DrawerMenu';

type AdaptiveDrawerProps = DrawerProps & {
  mode?: 'fixed' | 'absolute'
};

const useStyles = makeStyles(() => createStyles({
  drawerAbsolute: {
    width: 58,
    height: 'calc(100vh - 38px)',
    overflow: 'hidden',
    marginTop: 38,
  },
  drawerFixed: {
    height: '100vh',
  },
}));

const StyledDrawer = withStyles((theme: Theme) => (
  createStyles({
    paper: {
      width: drawerWidth,
      backgroundColor: theme.palette.type === "dark" ? '#303030' : 'rgba(255, 255, 255, 1)',
      backdropFilter: `saturate(180%) blur(5px)`,
    },
    root: {
      backgroundColor: 'rgba(0, 0, 0, .4)',
      backdropFilter: `saturate(180%) blur(5px)`,
    }
  })
))(Drawer);

export const AdaptiveDrawer = (props: AdaptiveDrawerProps) => {
  const styles = useStyles();
  if (props.mode === 'fixed') {
    return <StyledDrawer {...props} className={styles[`drawerFixed`]} />;
  }
  return (
      <StyledDrawer {...props} variant="permanent" className={styles[`drawerAbsolute`]} />
  );
};
