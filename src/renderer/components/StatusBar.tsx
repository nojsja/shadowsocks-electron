import React from 'react';
import { Theme } from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { grey } from '@material-ui/core/colors';
import { Sync as SyncIcon } from '@material-ui/icons';

import { useTypedSelector } from '@renderer/redux/reducers';
import StatusBarNetwork from '@renderer/components/BarItems/StatusBarNetwork';
import StatusBarTraffic from '@renderer/components/BarItems/StatusBarTraffic';
import StatusBarConnection from '@renderer/components/BarItems/StatusBarConnection';

type StatusBarProps = {
  left?: React.ReactElement[];
  right?: React.ReactElement[];
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    '@keyframes rotate': {
      '0%': {
        transform: 'rotateZ(0deg)',
      },
      '100%': {
        transform: 'rotateZ(-360deg)',
      },
    },
    loadingIcon: {
      marginRight: 0,
      fontSize: '14px',
      '&.rotate': {
        animationName: '$rotate',
        animationDuration: '1s',
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite',
      },
    },
    statusBarWrapper: {
      padding: '4px 8px',
      position: 'fixed',
      height: '20px',
      bottom: 0,
      left: 0,
      width: '100%',
      zIndex: 2,
      backgroundColor: grey[900],
      // backgroundColor: grey[800],
      fontSize: '12px',
      color: 'white',
      '& > .left-panel': {
        display: 'inline-flex',
        height: '100%',
        width: '50%',
        alignItems: 'center',
        verticalAlign: 'top',
      },
      '& > .right-panel': {
        display: 'inline-flex',
        height: '100%',
        width: '50%',
        direction: 'rtl',
        alignItems: 'center',
        verticalAlign: 'top',
      },
      '& .status-bar-item': {
        display: 'flex',
        alignItems: 'center',
        marginLeft: theme.spacing(0.2),
        marginRight: theme.spacing(0.2),
        color: grey[400],
      },
    },
  }),
);

export const StatusBarItem: React.FC<{ children: React.ReactNode }> = (
  props,
) => {
  return <div className="status-bar-item">{props.children}</div>;
};

const StatusBar: React.FC<StatusBarProps> = (props) => {
  const styles = useStyles();
  const delay = useTypedSelector((state) => state.status.delay);
  const loading = useTypedSelector((state) => state.status.loading);
  const connected = useTypedSelector((state) => state.status.connected);
  const { left = [], right = [] } = props;

  return (
    <div className={styles.statusBarWrapper}>
      <div className={'left-panel'}>
        <SyncIcon
          key="status_bar_rotate"
          fontSize="small"
          className={`${styles.loadingIcon} ${loading ? 'rotate' : ''}`}
        />
        <StatusBarNetwork key="status_bar_network" delay={delay} />
        <span key="status_bar_splitter">/</span>
        <StatusBarTraffic key="status_bar_traffic" />
        {left.map((item) => (
          <StatusBarItem key={item.key as string}>{item}</StatusBarItem>
        ))}
      </div>
      <div className={'right-panel'}>
        {right.map((item) => (
          <StatusBarItem key={item.key as string}>{item}</StatusBarItem>
        ))}
        <StatusBarConnection
          key="status_bar_connection"
          status={connected ? 'online' : 'offline'}
        />
      </div>
    </div>
  );
};

export default StatusBar;
