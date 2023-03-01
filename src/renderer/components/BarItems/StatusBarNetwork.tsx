import React from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles, createStyles } from '@material-ui/core/styles';

type StatusBarProps = {
  delay: number | null | ''
}

const useStyles = makeStyles(() =>
  createStyles({
    text: {
      display: 'inline-block',
      fontSize: '11px',
      padding: '2px 2px'
    }
  })
);

const StatusBarNetwork: React.FC<StatusBarProps> = (props) => {
  const styles = useStyles();
  const { t } = useTranslation();

  return (
    <span className={styles.text}>{t('delay').toLowerCase()}: {props.delay ? props.delay : 0}ms</span>
  );
};

export default StatusBarNetwork;
