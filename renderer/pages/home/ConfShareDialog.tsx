import React from "react";
import { clipboard } from "electron";
import {
  DialogProps,
  DialogContent,
  Divider
} from "@material-ui/core";
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import GetAppIcon from '@material-ui/icons/GetApp';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import { SnackbarMessage } from 'notistack';
import { useDispatch } from "react-redux";

import { saveDataURLAsFile } from '../../utils';
import { DialogTitle } from './AddServerDialog';
import { AdaptiveDialog } from "../../components/Pices/Dialog";
import { withStyles } from "@material-ui/styles";
import { CloseOptions, Notification } from '../../types';
import { enqueueSnackbar as enqueueSnackbarAction } from '../../redux/actions/notifications';

export interface MediaCardProps {
  dataUrl: string
  url: string
  onClose: (selection: "qrcode" | "url" | "manual" | "share" | '') => void
}

export interface ConfShareDialogProps extends DialogProps, MediaCardProps {
  onClose: (selection: CloseOptions) => void
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    media: {
      height: 150,
      width: 150,
      margin: 'auto'
    },
    mediaWrapper: {
      marginTop: theme.spacing(2)
    },
    textOverflow: {
      width: '100%',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    action: {
      display: 'flex',
      justifyContent: 'space-between'
    },
    button: {
      margin: theme.spacing(1),
      color: theme.palette.primary.light
    }
  })
);

export const StyledCard = withStyles(
  () => (
    createStyles({
      root: {
        backgroundColor: 'transparent !important',
        maxWidth: 300,
        boxShadow: 'none'
      },
    })
  )
)(Card);

const MediaCard: React.FC<MediaCardProps> = (props) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const enqueueSnackbar = (message: SnackbarMessage, options: Notification) => {
    dispatch(enqueueSnackbarAction(message, options))
  };

  const downloadPicture = (dataLink: string) => {
    setTimeout(() => {
      props.onClose('share');
    }, 1e3);
    saveDataURLAsFile(dataLink, 'share');
  }

  const copyLink = (link: string) => {
    setTimeout(() => {
      props.onClose('share');
    }, 1e3);
    enqueueSnackbar(t('copied'), { variant: 'success' });
    clipboard.writeText(link, 'clipboard');
  }

  return (
    <StyledCard>
      <CardActionArea>
        <CardMedia
          component="img"
          className={classes.media}
          image={props.dataUrl}
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="h2"></Typography>
          <Typography variant="body2" color="textSecondary" component="span">
            <p className={classes.textOverflow}>
              {props.url}
            </p>
          </Typography>
        </CardContent>
      </CardActionArea>
      <Divider />
      <CardActions className={classes.action}>
        <Button
          className={classes.button}
          size="small" onClick={() => copyLink(props.url)}
          endIcon={<FileCopyIcon />}
        >
          {t('copy_link')}
        </Button>
        <Button
          className={classes.button}
          size="small" onClick={() => downloadPicture(props.dataUrl)}
          endIcon={<GetAppIcon />}
        >
          {t('save')}
        </Button>
      </CardActions>
    </StyledCard>
  );
}

const ConfShareDialog: React.FC<ConfShareDialogProps> = props => {
  const { onClose, open } = props;
  // const { t } = useTranslation();
  const classes = useStyles();

  return (
    <AdaptiveDialog color="primary" onClose={() => onClose('share')} open={open}>
      <DialogTitle onClose={onClose} attr='share'></DialogTitle>
      <DialogContent className={classes['mediaWrapper']}>
        <MediaCard
          url={props.url} dataUrl={props.dataUrl} onClose={onClose}
        />
      </DialogContent>
    </AdaptiveDialog>
  );
};

export default ConfShareDialog;
