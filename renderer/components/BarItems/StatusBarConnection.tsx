import React from 'react';
import {
  Theme,
  Badge
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { makeStyles, createStyles, withStyles } from '@material-ui/core/styles';
import { green, grey, orange, blue } from '@material-ui/core/colors';
import clsx from 'clsx';
import { useTypedSelector } from '../../redux/reducers';

type StatusBarConnectionProps = {
  status: 'online' | 'offline' | 'cluster'
};

const StyledBadge = withStyles((theme: Theme) =>
  createStyles({
    badge: {
      left: -8,
      bottom: 8,
      color: grey[500],
      backgroundColor: orange[400]
    }
  }),
)(Badge);

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    offline: {
      '& .MuiBadge-badge': {
        backgroundColor: orange[400]
      }
    },
    online: {
      '& .MuiBadge-badge': {
        backgroundColor: green[400]
      }
    },
    cluster: {
      '& .MuiBadge-badge': {
        backgroundColor: blue[400]
      }
    }
  })
);

const StatusBarConnection: React.FC<StatusBarConnectionProps> = (props) => {
  const styles = useStyles();
  const { t } =  useTranslation();
  const settings = useTypedSelector(state => state.settings);
  const { nodeMode } = settings;

  return (
    <StyledBadge
      className={
        styles[
          clsx(
            (nodeMode === 'cluster' && props.status === 'online') &&  'cluster',
            (nodeMode !== 'cluster' && props.status === 'online') && 'online',
            (props.status === 'offline') && 'offline'
          ) as 'online' | 'offline' | 'cluster'
        ]
      }
      variant="dot"
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}>
      <span>
        {
          clsx(
            props.status === 'online' && t('online').toLowerCase(),
            props.status !== 'online' && t('offline').toLowerCase()
          )

        }
      </span>
    </StyledBadge>
  );
};

export default StatusBarConnection;
