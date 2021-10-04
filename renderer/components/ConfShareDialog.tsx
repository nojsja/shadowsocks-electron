import React from "react";
import { clipboard } from "electron";
import {
  Dialog,
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

import { saveDataURLAsFile } from '../utils';
import useSnackbarAlert from '../hooks/useSnackbarAlert';
import { DialogTitle } from './AddServerDialog';

export interface ConfShareDialog extends DialogProps, MediaCard {
  onClose: (selection: "qrcode" | "url" | "manual" | "share" | '') => void
}

export interface MediaCard {
  dataUrl: string
  url: string
  onClose: (selection: "qrcode" | "url" | "manual" | "share" | '') => void
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      maxWidth: 300,
      boxShadow: 'none'
    },
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
    media: {
      height: 100,
      width: 100,
      margin: 'auto'
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
    }
  })
);

const MediaCard: React.FC<MediaCard> = (props) => {
  const classes = useStyles();

  const { t } = useTranslation();
  const [SnackbarAlert, setSnackbarMessage] = useSnackbarAlert();

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
    setSnackbarMessage(t('copied'));
    clipboard.writeText(link, 'clipboard');
  }

  return (
    <Card className={classes.root}>
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
          size="small" color="primary" onClick={() => copyLink(props.url)}
          endIcon={<FileCopyIcon />}
        >
          {t('copy_link')}
        </Button>
        <Button
          className={classes.button}
          size="small" color="primary" onClick={() => downloadPicture(props.dataUrl)}
          endIcon={<GetAppIcon />}
        >
          {t('save')}
        </Button>
      </CardActions>
      { SnackbarAlert }
    </Card>
  );
}

const ConfShareDialog: React.FC<ConfShareDialog> = props => {
  const { onClose, open } = props;
  // const { t } = useTranslation();

  return (
    <Dialog color="primary" onClose={() => onClose('share')} open={open}>
      <DialogTitle onClose={onClose} attr='share'></DialogTitle>
      <DialogContent>
        <MediaCard
          url={props.url} dataUrl={props.dataUrl} onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ConfShareDialog;
