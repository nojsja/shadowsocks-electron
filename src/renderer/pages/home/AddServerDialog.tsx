import React from 'react';
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  DialogProps,
  ButtonBaseProps,
  ListItemProps,
  DialogTitleProps,
  Typography,
  IconButton,
} from '@material-ui/core';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import { useTranslation } from 'react-i18next';
import CropFreeIcon from '@material-ui/icons/CropFree';
import CopyIcon from '@material-ui/icons/LibraryBooks';
import CloseIcon from '@material-ui/icons/Close';
import CreateIcon from '@material-ui/icons/Create';

import { AdaptiveDialog } from '@renderer/components/Pices/Dialog';
import { TextWithTooltip } from '@renderer/components/Pices/TextWithTooltip';

import { CloseOptions } from '@renderer/types';

export type onCloseType = (selection: CloseOptions) => void;

export interface AddServerDialogProps extends DialogProps {
  onClose: onCloseType
}

export interface DefineDialogTitleProps extends DialogTitleProps {
  onClose: onCloseType
  attr: CloseOptions
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      margin: 0,
      padding: theme.spacing(2),
    },
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
  }));


const ListItemButton = ListItem as React.ComponentType<
  ButtonBaseProps & ListItemProps
>;

export const DialogTitle = (props: DefineDialogTitleProps) => {
  const classes = useStyles();
  const { attr, children, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={() => onClose(attr)}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
};

const AddServerDialog: React.FC<AddServerDialogProps> = props => {
  const { onClose, open } = props;
  const { t } = useTranslation();

  return (
    <AdaptiveDialog onClose={() => onClose('')} open={open}>
      <DialogTitle attr='' onClose={onClose}>{t('add_server')}</DialogTitle>
      <List>
        <ListItemButton button onClick={() => onClose("manual")}>
          <ListItemAvatar>
            <CreateIcon />
          </ListItemAvatar>
          <ListItemText primary={t('add_server_manually')} />
        </ListItemButton>
        <ListItemButton button onClick={() => onClose("qrcode")}>
          <ListItemAvatar>
            <CropFreeIcon />
          </ListItemAvatar>
          <ListItemText primary={t('scan_qt_code_from_screen')} />
        </ListItemButton>
        <ListItemButton button onClick={() => onClose("url")}>
          <ListItemAvatar>
            <CopyIcon />
          </ListItemAvatar>
          <ListItemText primary={
            <TextWithTooltip
              text={t('import_server_url_from_clipboard')}
              tooltip={t('import_server_url_from_clipboard_tips')}
              iconAlign="top"
            />
          } />
        </ListItemButton>
        <ListItemButton button onClick={() => onClose("subscription")}>
          <ListItemAvatar>
            <CopyIcon />
          </ListItemAvatar>
          <ListItemText primary={
            <TextWithTooltip
              text={t('import_server_subscription_from_clipboard')}
              tooltip={t('import_server_subscription_from_clipboard_tips')}
              iconAlign="top"
            />
          }
          />
        </ListItemButton>
      </List>
    </AdaptiveDialog>
  );
};

export default AddServerDialog;
