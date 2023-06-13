import { Theme } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/styles';
import { scrollBarStyle } from '@renderer/pages/style';

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: 'flex !important',
      flexDirection: 'column',
      flexGrow: 1,
      flexShrink: 0,
      padding: theme.spacing(2),
      overflowY: 'scroll',
      alignItems: 'center',
      ...scrollBarStyle(0, 0, theme),
    },
    form: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(3),
      width: '100%',
    },
    list: {
      width: '100%',
      padding: 0,
    },
    listItemSub: {
      marginLeft: '10px',
    },
    indentInput: {
      '& input': {
        width: theme.spacing(10),
        textAlign: 'right',
      },
    },
    cursorPointer: {
      position: 'relative',
      cursor: 'pointer',
      top: '-2px',
    },
    colorGrey: {
      color: 'grey',
    },
    textField: {
      marginBottom: `${theme.spacing(2)}px !important`,
    },
  }),
);
