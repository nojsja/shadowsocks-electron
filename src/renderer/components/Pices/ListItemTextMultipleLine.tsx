import { createStyles, ListItemText, withStyles } from '@material-ui/core';

const ListItemTextMultipleLine = withStyles(() =>
  createStyles({
    root: {
      margin: 0
    },
    primary: {
      wordBreak: 'break-all'
    },
    secondary: {
      wordBreak: 'break-all'
    }
  })
)(ListItemText);

export default ListItemTextMultipleLine;
