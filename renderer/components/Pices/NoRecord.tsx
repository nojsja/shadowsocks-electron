import { createStyles, makeStyles, Theme, Typography } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => createStyles({
  noRecord: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(1.5),
  },
  noRecordTitle: {},
  noRecordDescription: {},
}));

interface Props {
  title?: React.ReactNode;
  description?: React.ReactNode;
  hidden?: boolean;
}

const NoRecord: React.FC<Props> = ({
  title = 'No Record',
  description = null,
  hidden = false,
}) => {
  const styles = useStyles();
  if (hidden) return null;

  return (
    <div className={styles.noRecord}>
      <div className={styles.noRecordTitle}>
        <Typography variant="body1" color="textSecondary">
          {title}
        </Typography>
      </div>
      {
        description && (
          <div className={styles.noRecordDescription}>{description}</div>
        )
      }
    </div>
  );
}

export default NoRecord;
