import React from 'react';
import { withStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Drawer, DrawerProps }  from '@material-ui/core';
import { drawerWidth } from '../DrawerMenu';

const StyledDrawer = withStyles((theme: Theme) => (
  createStyles({
    paper: {
      width: drawerWidth,
      backgroundColor: theme.palette.type === "dark" ? 'rgba(255,255,255, .2)' : 'rgba(255, 255, 255, 1)',
      backdropFilter: `saturate(180%) blur(5px)`,
    },
    root: {
      backgroundColor: 'rgba(0, 0, 0, .4)',
      backdropFilter: `saturate(180%) blur(5px)`,
    }
  })
))(Drawer);

export const AdaptiveDrawer = (props: DrawerProps) => {
  return <StyledDrawer {...props} />;
};
