import React from 'react';
import { withStyles, Theme, createStyles } from '@material-ui/core/styles';
import { AppBar, AppBarProps }  from '@material-ui/core';
import { grey } from '@material-ui/core/colors';

const StyledAppBar = withStyles((theme: Theme) => (
  createStyles({
    root: {
      boxShadow: 'none',
      backgroundColor: theme.palette.type === 'dark' ? grey[900] : grey[200],
      color: theme.palette.type === "dark" ? 'rgba(255,255,255, .8)' : 'rgba(0, 0, 0, .8)',
    },
  })
))(AppBar);

export const AdaptiveAppBar = (props: AppBarProps) => {
  return <StyledAppBar {...props} />;
};
