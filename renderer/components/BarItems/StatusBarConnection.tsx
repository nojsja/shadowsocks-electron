import React from 'react';
import {
  Theme,
  Badge
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { makeStyles, createStyles, withStyles } from '@material-ui/core/styles';
import { green, grey, orange } from '@material-ui/core/colors';
import clsx from 'clsx';

type StatusBarConnectionProps = {
  status: 'online' | 'offline'
};

const StyledBadge = withStyles((theme: Theme) =>
  createStyles({
    badge: {
      left: -8,
      bottom: 8,
      color: grey[500],
      backgroundColor: green[400]
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
    }
  })
);

const StatusBarConnection: React.FC<StatusBarConnectionProps> = (props) => {
  const styles = useStyles();
  const { t } =  useTranslation();

  return (
    <StyledBadge
      className={styles[props.status]}
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
