import { createStyles, makeStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import { scrollBarStyle } from '@renderer/pages/style';

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    contentWrapper: {
      paddingBottom: theme.spacing(2),
    },
    headerActions: {
      position: 'sticky',
      top: theme.spacing(0.5),
      display: 'flex',
      justifyContent: 'flex-end',
      marginBottom: theme.spacing(1),
      padding: `0 ${theme.spacing(0.5)}px`,
      zIndex: 1000,
    },
    headerActionButton: {
      cursor: 'pointer',
      color: theme.palette.text.secondary,
      '&.highlight': {
        color: theme.palette.primary.light,
      },
    },
    headerHelpInfoWrapper: {
      padding: theme.spacing(1),
      maxHeight: '80vh',
      maxWidth: '80vw',
      overflowY: 'auto',
      '& h1': {
        fontSize: '1.5em',
      },
      '& h2': {
        fontSize: '1.25em',
      },
      ...scrollBarStyle(6, 0, theme),
    },
    scriptWrapper: {
      display: 'flex',
      alignItems: 'center',
      paddingLeft: theme.spacing(0.5),
      margin: `${theme.spacing(1)}px 0px ${theme.spacing(1)}px ${theme.spacing(
        1,
      )}px`,
    },
    textEditorTitle: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      fontSize: 12,
      fontWeight: 500,
    },
    textEditorWrapper: {
      position: 'relative',
      height: '20vh',
      width: '80%',
      '&.wide': {
        width: '85%',
      },
      '&.high': {
        height: '30vh',
      },
    },
    textEditorContent: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    textEditorActions: {
      flex: 1,
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'wrap',
    },
    textEditorActionButton: {
      cursor: 'pointer',
      color: theme.palette.secondary.main,
      transition: 'color .3s',
      '&:hover': {
        color:
          theme.palette.secondary[
            theme.palette.type === 'dark' ? 'light' : 'dark'
          ],
      },
    },
    textEditorActionButtonActive: {
      color: theme.palette.primary.light,
    },
    required: {
      position: 'relative',
      '&:after': {
        position: 'absolute',
        top: '1px',
        display: 'inline-block',
        content: '"*"',
      },
      '&.error:after': {
        color: theme.palette.error.light,
      },
      '&.success:after': {
        color: theme.palette.success.light,
      },
    },
  }),
);
