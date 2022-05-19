import { createStyles, ListItemText, Theme, withStyles } from '@material-ui/core';

const ListItemTextMultibleLine = withStyles((theme: Theme) =>
  createStyles({
    primary: {
      wordBreak: 'break-all'
    },
    secondary: {
      wordBreak: 'break-all'
    }
  })
)(ListItemText);

export default ListItemTextMultibleLine;
