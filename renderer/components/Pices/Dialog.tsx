import React from 'react';
import { withStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Dialog, DialogProps }  from '@material-ui/core';
import { scrollBarStyle } from '../../pages/styles';

const StyledDialog = withStyles((theme: Theme) => (
  createStyles({
    paper: {
      backgroundColor: theme.palette.type === "dark" ? 'rgba(255,255,255, .2)' : 'rgba(255, 255, 255, 1)',
      backdropFilter: `saturate(180%) blur(5px)`,
    },
    root: {
      backgroundColor: 'rgba(0, 0, 0, .4)',
      backdropFilter: `saturate(180%) blur(5px)`,
      '& *': scrollBarStyle(6, 0, theme)
    }
  })
))(Dialog);

export const AdaptiveDialog = (props: DialogProps) => {
  return <StyledDialog {...props} />;
};
