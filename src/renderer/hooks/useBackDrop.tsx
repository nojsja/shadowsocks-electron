import React from 'react';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
}));

export const useBackdrop = (): [React.FC, React.MutableRefObject<any>] => {
  const classes = useStyles();
  const ref = React.useRef<any>(null);
  const [open, setOpen] = React.useState(false);

  ref.current = setOpen;

  return [
    () => (
      <Backdrop className={classes.backdrop} open={open}>
        <CircularProgress color="inherit" />
      </Backdrop>
    ),
    ref
  ];
}

export default useBackdrop;
