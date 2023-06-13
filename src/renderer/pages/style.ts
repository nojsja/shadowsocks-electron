import { makeStyles, createStyles } from '@material-ui/core/styles';
import { Theme } from '@material-ui/core';

export const scrollBarStyle = (
  width = 10,
  radius = 5,
  theme: Theme,
  color = '',
) => ({
  '&::-webkit-scrollbar': {
    width: width,
    height: width,
  },
  '&::-webkit-scrollbar-track': {
    '-webkit-box-shadow': `inset 0 0 3px ${
      theme.palette.type === 'dark' ? 'rgba(0, 0, 0, 1)' : 'rgba(0, 0, 0, 0.3)'
    }`,
    borderRadius: radius,
  },
  '&::-webkit-scrollbar-thumb': {
    ...(color
      ? {
          background: `color !important`,
        }
      : {
          background: theme.palette.type === 'dark' ? 'darkgrey' : 'lightgrey',
        }),
    borderRadius: radius,
  },
});

export const useLayoutStyles = makeStyles((theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    toolbar: {
      minHeight: '42px',
    },
    content: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minHeight: 0,
      overflow: 'hidden',
    },
    container: {
      position: 'relative',
      display: 'flex !important',
      flexDirection: 'column',
      flexGrow: 1,
      flexShrink: 0,
      alignItems: 'center',
      padding: theme.spacing(1),
      paddingTop: 0,
    },
    scrollContainer: {
      position: 'absolute',
      overflow: 'auto',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      ...scrollBarStyle(6, 0, theme),
    },
  }),
);
