import React from 'react';
import {
  Theme
} from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/core/styles';

type StatusBarProps = {
  left: React.ReactElement[];
  right: React.ReactElement[];
};

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

const StatusBar: React.FC<StatusBarProps> =  (props) => {
  const styles = useStyles();
  const { left, right } = props;

  return (
    <div className={styles['status-bar-wrapper']}>
      <div className={'left-pannel'}>
        { left }
      </div>
      <div className={'right-pannel'}>
        { right }
      </div>
    </div>
  );
};

export default StatusBar;
