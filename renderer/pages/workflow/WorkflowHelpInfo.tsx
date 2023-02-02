import React from 'react';
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';
import { IconButton } from '@material-ui/core';
import HelpOutlinedIcon from '@material-ui/icons/HelpOutlined';

import { useStylesOfWorkflow } from '../styles';

export default function WorkflowHelpInfo() {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const styles = useStylesOfWorkflow();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'help-popover' : undefined;

  return (
    <div>
      <IconButton size="small" onClick={handleClick}>
        <HelpOutlinedIcon className={`${styles.headerActionButton}`} aria-describedby={id} color="action" />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Typography className={styles.headerHelpInfoWrapper}>
          The content of the Popover.
        </Typography>
      </Popover>
    </div>
  );
}
