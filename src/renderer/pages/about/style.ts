import { Theme } from '@material-ui/core';
import { grey } from '@material-ui/core/colors';
import { createStyles, makeStyles } from '@material-ui/styles';
import { scrollBarStyle } from '@renderer/pages/style';

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    contentWrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'column',
      padding: theme.spacing(2),
    },
    textCenter: {
      textAlign: 'center',
    },
    authorInfoWrapper: {
      display: 'inline-flex',
      width: '40%',
      height: '30%',
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 'auto',
      marginRight: 'auto',
      marginBottom: '0',
      textAlign: 'center',
      borderRadius: '50%',
    },
    authorInfoImage: {
      width: '80%',
      height: 'auto',
    },
    authorInfoOthers: {
      display: 'inline-block',
      textAlign: 'left',
      margin: '10px auto',
      color: theme.palette.type === 'dark' ? grey[400] : grey[600],
    },
    linkColorLight: {
      color: theme.palette.primary.light,
    },
    releaseDrawerButton: {
      position: 'fixed',
      bottom: theme.spacing(0.5),
      right: theme.spacing(0.5),
      textAlign: 'right',
      color: theme.palette.type === 'dark' ? grey[400] : grey[600],
      cursor: 'pointer',
      zIndex: 2000,
      '&:hover': {
        color: theme.palette.primary.main,
      },
    },
    copyright: {
      textAlign: 'center',
      color: theme.palette.type === 'dark' ? grey[400] : grey[600],
    },
    cursorPointer: {
      cursor: 'pointer',
    },
    releaseDrawerWrapper: {
      '& *': scrollBarStyle(6, 0, theme),
      '-webkit-app-region': 'none',
    },
    releaseDrawerClose: {
      position: 'fixed',
      top: theme.spacing(1),
      right: theme.spacing(1),
    },
  }),
);
