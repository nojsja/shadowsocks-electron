import os from 'os';
import React from 'react';
import { withStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Dialog, DialogProps }  from '@material-ui/core';

import { scrollBarStyle } from '@renderer/pages/styles';

interface AdaptiveDialogProps extends DialogProps {
  noScrollBarColor?: boolean;
}

const StyledDialog = withStyles((theme: Theme) => (
  createStyles({
    paper: {
      backgroundColor: theme.palette.type === "dark" ? 'rgba(255,255,255, .2)' : 'rgba(255, 255, 255, 1)',
      backdropFilter: `saturate(180%) blur(5px)`,
    },
    root: {
      backgroundColor: 'rgba(0, 0, 0, .4)',
      backdropFilter: (os.platform() === 'linux') ? 'none' : 'saturate(180%) blur(5px)',
      '& *': scrollBarStyle(6, 0, theme)
    }
  })
))(Dialog);

export const AdaptiveDialog = (props: AdaptiveDialogProps) => {
  return (
    <StyledDialog
      {...props}
    />
  );
};
