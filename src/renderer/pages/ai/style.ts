import { createStyles, makeStyles } from '@material-ui/styles';

export const useStyles = makeStyles(() =>
  createStyles({
    contentWrapper: {
      backgroundColor: '#eeeeee',
      display: 'flex !important',
      justifyContent: 'center',
      flexDirection: 'row',
      padding: '0 !important',
      width: '100%',
      height: '100%',
      '& > section': {
        marginRight: 4,
      },
    },
  }),
);
