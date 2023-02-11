import { makeStyles, createStyles } from "@material-ui/core/styles";
import { Theme } from "@material-ui/core";
import { grey } from "@material-ui/core/colors";

export const scrollBarStyle = (width = 10, radius = 5, theme: Theme) => ({
  "&::-webkit-scrollbar": {
    width: width,
  },
  "&::-webkit-scrollbar-track": {
      "-webkit-box-shadow": `inset 0 0 3px ${theme.palette.type === 'dark' ? 'rgba(0, 0, 0, 1)' : 'rgba(0, 0, 0, 0.3)'}`,
      borderRadius: radius
  },
  "&::-webkit-scrollbar-thumb": {
      borderRadius: radius,
      background: theme.palette.type === 'dark' ? 'darkgrey' : 'lightgrey'
  }
});

export const useStylesOfHome = makeStyles((theme: Theme) =>
  createStyles({
    "@keyframes rotate": {
      "0%": {
        transform: "rotateZ(0deg)"
      },
      "100%": {
        transform: "rotateZ(-360deg)"
      }
    },
    loadingIcon: {
      marginRight: 0,
      fontSize: '14px',
      '&.rotate': {
        animationName: '$rotate',
        animationDuration: '1s',
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite'
      }
    },
    container: {
      display: 'flex !important',
      flexDirection: 'column',
      alignItems: 'center',
      height: 'calc(100vh - 56px)',
      padding: theme.spacing(1),
      paddingTop: 0,
      [theme.breakpoints.up('sm')]: {
        height: 'calc(100vh - 64px)',
      }
    },
    list: {
      width: "100%",
      flex: 1,
      overflowY: "auto",
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
      borderBottom: 'solid 2px white'
    },
    scrollbar: scrollBarStyle(6, 0, theme),
    extendedIcon: {
      marginRight: theme.spacing(1)
    },
    snackbar: {
      marginBottom: theme.spacing(10)
    }
  })
);

export const useStylesOfAbout = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      position: 'relative',
      display: 'flex !important',
      alignItems: 'center',
      flexDirection: 'column',
      height: 'calc(100vh - 56px)',
      padding: theme.spacing(2),
      [theme.breakpoints.up('sm')]: {
        height: 'calc(100vh - 64px)',
      }
    },
    textCenter: {
      textAlign: 'center'
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
      borderRadius: '50%'
    },
    authorInfoImage: {
      width: '80%',
      height: 'auto'
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
      bottom: theme.spacing(.5),
      right: theme.spacing(.5),
      textAlign: 'right',
      color: theme.palette.type === 'dark' ? grey[400] : grey[600],
      cursor: 'pointer',
      zIndex: 2000,
      '&:hover': {
        color: theme.palette.primary.main,
      }
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
  })
);

export const useStylesOfSettings = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: 'flex !important',
      flexDirection: 'column',
      height: `calc(100vh - 64px)`,
      padding: theme.spacing(2),
      borderLeft: `solid 1px ${theme.palette.type === 'dark' ? grey[700] : grey[300]}`,
      borderRight: `solid 1px ${theme.palette.type === 'dark' ? grey[700] : grey[300]}`,
      overflowY: 'scroll',
      alignItems: 'center',
      ...scrollBarStyle(0, 0, theme)
    },
    form: {
      width: "100%",
    },
    list: {
      width: "100%",
      padding: 0
    },
    listItemSub: {
      marginLeft: '10px'
    },
    indentInput: {
      '& input': {
        width: theme.spacing(10),
        textAlign: 'right'
      }
    },
    cursorPointer: {
      position: 'relative',
      cursor: 'pointer',
      top: '-2px'
    },
    colorGrey: {
      color: 'grey'
    },
    textField: {
      marginBottom: `${theme.spacing(2)}px !important`
    }
  })
);

export const useStylesOfWorkflow = makeStyles((theme) => createStyles({
  container: {
    position: 'relative',
    display: 'flex !important',
    flexDirection: 'column',
    height: `calc(100vh - 56px)`,
    padding: theme.spacing(.5),
    paddingTop: 0,
    [theme.breakpoints.up('sm')]: {
      height: `calc(100vh - 64px)`,
    },
    overflowY: 'auto',
    ...scrollBarStyle(6, 0, theme),
  },
  headerActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: theme.spacing(1),
    padding: `0 ${theme.spacing(.5)}px`,
  },
  headerActionButton: {
    cursor: 'pointer',
    color: theme.palette.text.secondary,
    '&.highlight': {
      color: theme.palette.primary.light,
    }
  },
  headerHelpInfoWrapper: {
    padding: theme.spacing(1),
  },
  scriptWrapper: {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: theme.spacing(.5),
    margin: `${theme.spacing(1)}px 0px ${theme.spacing(1)}px ${theme.spacing(1)}px`,
  },
  textEditorTitle: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    fontSize: 12,
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
      color: theme.palette.secondary[theme.palette.type === 'dark' ? 'light' : 'dark'],
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
    }
  }
}));
