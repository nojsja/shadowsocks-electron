/**
  * @name nojsja
  * @description alert component based on snackbar
  */
import React, { useState, useMemo, ReactElement } from 'react';
import { makeStyles, createStyles } from "@material-ui/core/styles";
import {
  Theme,
  Snackbar,
  Slide
} from "@material-ui/core";
import { TransitionProps } from '@material-ui/core/transitions/transition';

interface SnackbarAlertProps {
  duration?: number,
  vertical?: 'bottom' | 'top',
  horizontal?: 'left' | 'right' | 'center',
  direction?: 'left' | 'right' | 'up' | 'down'
};

interface SetMessage {
  (msg: string): void
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    snackbar: {
      marginBottom: theme.spacing(2),
      marginLeft: '50%',
      width: '70%',
      transform: 'translatex(-50%)',
      color: 'black',
      '& > div': {
        backgroundColor: 'rgba(255, 255, 255, 1)',
        color: 'rgb(49, 49, 49)'
      }
    }
  })
);

const transition = (props: TransitionProps) => <Slide {...props} direction="down" />;

const useSnackbarAlert = (props?: SnackbarAlertProps): [ReactElement, SetMessage] => {
  const styles = useStyles();
  const [message, setMessage] = useState('');
  return [
    (
      useMemo((() =>
        <Snackbar
          className={styles.snackbar}
          anchorOrigin={{
            vertical: props?.vertical || "top",
            horizontal: props?.horizontal || "right"
          }}
          TransitionComponent={transition}
          open={!!message}
          autoHideDuration={props?.duration || 1e3}
          onClose={() => setMessage('')}
          message={message}
        />), [message])
    ),
    (msg: string) => setMessage(msg)
  ];
};

export default useSnackbarAlert;
