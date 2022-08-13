import { createStyles, makeStyles, Theme } from '@material-ui/core';
import React from 'react';

export type TextEllipsisType = {
  text: string;
};

const useStyles = makeStyles((theme: Theme) => createStyles({
  text: {
    display: 'inline-block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    wordBreak: 'break-all',
  }
}));

export default function TextEllipsis(props: TextEllipsisType) {
  const styles = useStyles();
  return <div className={styles.text}>{ props.text }</div>;
}
