import { makeStyles, createStyles } from "@material-ui/core/styles";
import { Theme } from "@material-ui/core";

export const scrollBarStyle = (width: number = 10, radius: number = 5, theme: Theme) => ({
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
    'statu-sbar_modeinfo': {
      marginRight: theme.spacing(3)
    },
    'loading-icon': {
      marginRight: '0',
      fontSize: '14px',
      '&.rotate': {
        animationName: '$rotate',
        animationDuration: '1s',
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite'
      }
    },
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      height: `calc(100vh - 56px)`,
      padding: theme.spacing(1),
      paddingTop: 0,
      [theme.breakpoints.up('sm')]: {
        height: `calc(100vh - 64px)`,
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
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      height: `calc(100vh - 56px)`,
      padding: theme.spacing(2),
      [theme.breakpoints.up('sm')]: {
        height: `calc(100vh - 64px)`,
      }
    },
    'text-center': {
      textAlign: 'center'
    },
    'author-info__wrapper': {
      display: 'inline-flex',
      width: '40%',
      height: '40%',
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 'auto',
      marginRight: 'auto',
      marginBottom: '0',
      textAlign: 'center',
      borderRadius: '50%'
    },
    'author-info__image': {
      width: '80%',
      height: 'auto'
    },
    'author-info__others': {
      display: 'inline-block',
      textAlign: 'left',
      margin: '10px auto',
      color: 'grey'
    },
    'link-color__light': {
      color: theme.palette.primary.light,
    }
  })
);

export const useStylesOfSettings = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      height: `calc(100vh - 64px)`,
      overflowY: 'scroll',
      padding: theme.spacing(2),
      ...scrollBarStyle(0, 0, theme)
    },
    indentInput: {
      '& input': {
        width: theme.spacing(10),
        textAlign: 'right'
      }
    },
    list: {
      width: "100%"
    },
    textField: {
      marginBottom: `${theme.spacing(2)}px !important`
    },
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
    'switch-button__color': {
      color: theme.palette.primary.light,
    },
    margin: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2)
    }
  })
);
