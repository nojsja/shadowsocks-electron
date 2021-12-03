import { withStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Switch }  from '@material-ui/core';

export const AdaptiveSwitch = withStyles((theme: Theme) => (
  createStyles({
    switchBase: {
      color: theme.palette.secondary.light,
      '&$checked': {
        color: theme.palette.primary.light,
      },
      '&$checked + $track': {
        backgroundColor: theme.palette.primary.light,
      },
    },
    checked: {},
    track: {

    },
  })
))(Switch);
