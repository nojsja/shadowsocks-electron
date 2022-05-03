import React, { useState, useCallback} from "react";
import {
  DialogProps,
  DialogTitleProps,
  Typography,
  IconButton,
  Container,
} from "@material-ui/core";
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import { useTranslation } from 'react-i18next';
import CloseIcon from '@material-ui/icons/Close';
import { AdaptiveDialog } from "./Pices/Dialog";

import { CloseOptions, Settings } from '../types';
import { scrollBarStyle } from "../pages/styles";
import StyledTextareaAutosize from "./Pices/TextAreaAutosize";

export type onCloseType = (selection: CloseOptions) => void;

export interface EditAclDialog extends DialogProps {
  onClose: onCloseType,
  onTextChange: (attr: keyof Settings, e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void,
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
    container: {
      width: '320px',
      overflow: 'auto',
      paddingBottom: '12px',
      ...scrollBarStyle(6, 0, theme)
    },
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
  const { onClose, open, onTextChange } = props;
  const [text, setText] = useState('');
  const { t } = useTranslation();
  const classes = useStyles();

  const setTextInfo = useCallback((attr: keyof Settings, event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
  }, []);

  const onCloseDialog = () => {
    onTextChange('acl', { target: { value: text } } as React.ChangeEvent<HTMLTextAreaElement>);
    onClose('');
  }

  return (
    <AdaptiveDialog onClose={onCloseDialog} open={open}>
      <DialogTitle attr='' onClose={onCloseDialog}>{t('acl_settings')}</DialogTitle>
      <Container className={classes.container}>
        <StyledTextareaAutosize rows={10} placeholder={tips} onTextChange={setTextInfo}/>
      </Container>
    </AdaptiveDialog>
  );
};

export default EditAclDialog;
