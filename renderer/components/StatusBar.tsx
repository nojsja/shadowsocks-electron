import React from 'react';
import {
  Theme
} from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { grey } from '@material-ui/core/colors';

type StatusBarProps = {
  left: React.ReactElement[];
  right: React.ReactElement[];
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    'status-bar-wrapper': {
      padding: '4px 8px',
      position: 'fixed',
      height: '20px',
      bottom: 0,
      left: 0,
      width: '100%',
      backgroundColor: grey[900],
      // backgroundColor: grey[800],
      fontSize: '12px',
      color: 'white',
      '& > .left-pannel': {
        display: 'inline-flex',
        height: '100%',
        width: '50%',
        alignItems: 'center',
        verticalAlign: 'top'
      },
      '& > .right-pannel': {
        display: 'inline-flex',
        height: '100%',
        width: '50%',
        direction: 'rtl',
        alignItems: 'center',
        verticalAlign: 'top'
      },
      '& .status-bar-item': {
        display: 'flex',
        alignItems: 'center',
        marginLeft: theme.spacing(.2),
        marginRight: theme.spacing(.2),
      }
    },
  })
);

export const StatusBarItem: React.FC<{}> = (props) => {
  return (
    <div className="status-bar-item">
      {
        props.children
      }
    </div>
  );
}

const StatusBar: React.FC<StatusBarProps> =  (props) => {
  const styles = useStyles();
  const { left, right } = props;

  return (
    <div className={styles['status-bar-wrapper']}>
      <div className={'left-pannel'}>
        { left.map(item => <StatusBarItem key={item.key as string}>{item}</StatusBarItem>) }
      </div>
      <div className={'right-pannel'}>
        { right.map(item => <StatusBarItem key={item.key as string}>{item}</StatusBarItem>) }
      </div>
    </div>
  );
};

export default StatusBar;
