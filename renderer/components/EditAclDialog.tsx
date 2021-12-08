import React from "react";
import {
  DialogProps,
  DialogTitleProps,
  Typography,
  IconButton,
  Container
} from "@material-ui/core";
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import { useTranslation } from 'react-i18next';
import CloseIcon from '@material-ui/icons/Close';
import { AdaptiveDialog } from "./Pices/Dialog";

import { closeOptions } from '../types';
import { scrollBarStyle } from "../pages/styles";

export type onCloseType = (selection: closeOptions) => void;

export interface EditAclDialog extends DialogProps {
  onClose: onCloseType
}

export interface DefineDialogTitleProps extends DialogTitleProps {
  onClose: onCloseType
  attr: closeOptions
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
    container: {
      width: '320px',
      overflow: 'auto',
      ...scrollBarStyle(6, 0, theme)
    },
    textarea: {
      width: '100%',
      border: 'solid 1px lightgrey',
      outline: 'none'
    }
  }));


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

const tips = `
-----(blacklist mode)-----

[by­pass_all]
1.0.1.0/24
(^|\.)baidu\.com$

[proxy_list]
(^|\.)google\.com$

-----(whitelist mode)-----

[proxy_all]
(^|\.)google\.com$

[by­pass_list]
1.0.1.0/24
(^|\.)baidu\.com$
`

const EditAclDialog: React.FC<EditAclDialog> = props => {
  const { onClose, open } = props;
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <AdaptiveDialog onClose={() => onClose('')} open={open}>
      <DialogTitle attr='' onClose={onClose}>{t('acl_settings')}</DialogTitle>
      <Container className={classes.container}>
        <textarea placeholder={tips} className={classes.textarea} rows={25} />
      </Container>
    </AdaptiveDialog>
  );
};

export default EditAclDialog;
