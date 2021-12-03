import React from 'react';
import { withStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Drawer, DrawerProps }  from '@material-ui/core';
import { drawerWidth } from '../DrawerMenu';

const StyledDrawer = withStyles((theme: Theme) => (
  createStyles({
    paper: {
      width: drawerWidth,
      backgroundColor: theme.palette.background.paper,
    },
    root: {
    }
  })
))(Drawer);

export const AdaptiveDrawer = (props: DrawerProps) => {
  return <StyledDrawer {...props} />;
};
