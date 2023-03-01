import React from 'react';
import { withStyles, createStyles } from '@material-ui/core/styles';
import { type IconButtonProps, IconButton }  from '@material-ui/core';

const StyledIconButton = withStyles(() => (
  createStyles({
    label: {
      '& .MuiSvgIcon-fontSizeSmall': {
        fontSize: '1rem',
      }
    },
  })
))(IconButton);

const IconButtonSmaller = (props: IconButtonProps) => {
  return <StyledIconButton {...props} />;
};

export default IconButtonSmaller;
