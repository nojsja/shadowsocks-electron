import React from 'react';
import {
  Theme,
  Badge
} from '@material-ui/core';
import { makeStyles, createStyles, withStyles } from '@material-ui/core/styles';
import { green, grey } from '@material-ui/core/colors';

const StyledBadge = withStyles((theme: Theme) =>
  createStyles({
    badge: {
      left: -8,
      bottom: 8,
      borderRadius: 3,
      padding: '0 5',
      color: grey[500],
      fontWeight: 'bold',
      backgroundColor: green[400]
    },
  }),
)(Badge);

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    'status-bar-wrapper': {
      display: 'flex',
      padding: '4px 8px',
      alignItems: 'center',
      position: 'fixed',
      height: '20px',
      bottom: 0,
      left: 0,
      width: '100%',
      backgroundColor: theme.palette.primary.main,
      fontSize: '12px',
      color: 'white',
      '& > .left-pannel': {
        width: '50%',
      },
      '& > .right-pannel': {
        width: '50%',
        direction: 'rtl'
      }
    },
  })
);

export default () => {
  const styles = useStyles();

  return (
    <div className={styles['status-bar-wrapper']}>
      <div className={'left-pannel'}>
        <span>延迟：145 ms</span>
      </div>
      <div className={'right-pannel'}>
        <StyledBadge variant="dot"
          anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}>
          <span>已连接</span>
        </StyledBadge>
      </div>
    </div>
  );
};
