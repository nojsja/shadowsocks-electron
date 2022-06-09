import React from 'react';
import {
  Theme
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { useTypedSelector } from '../../redux/reducers';
import { Traffic } from '../../types';

type StatusBarProps = {}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    text: {
      display: 'inline-block',
      fontSize: '11px',
      padding: '2px 2px'
    }
  })
);

const getTraffic = (traffic: Traffic) => {
  if (traffic.GB > 1) {
    return `${traffic.GB.toFixed(2)} GB`;
  }
  if (traffic.MB > 1) {
    return `${traffic.MB.toFixed(2)} MB`;
  }
  return `${traffic.KB.toFixed(0)} KB`;
}

const StatusBarTraffic: React.FC<StatusBarProps> = (props) => {
  const styles = useStyles();
  const { t } = useTranslation();
  const { traffic } = useTypedSelector((state) => state.status);

  return (
    <span className={styles.text}>
      {t('traffic')}: { getTraffic(traffic) }
    </span>
  );
};

export default StatusBarTraffic;
