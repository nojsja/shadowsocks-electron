import React from 'react';
import {
  Theme,
  Badge
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { makeStyles, createStyles, withStyles } from '@material-ui/core/styles';
import { green, grey, orange } from '@material-ui/core/colors';

type StatusBarConnectionProps = {
  status: 'online' | 'offline'
};

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
          props.status === 'online' ? t('connected') : t('offline')
        }
      </span>
    </StyledBadge>
  );
};

export default StatusBarConnection;
