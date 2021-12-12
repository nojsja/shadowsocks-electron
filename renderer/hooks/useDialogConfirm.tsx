/**
  * @name nojsja
  * @description alert component based on snackbar
  */
import React, { useState } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button
} from "@material-ui/core";
import { useTranslation } from 'react-i18next';
import { AdaptiveDialog } from '../components/Pices/Dialog';

type message = {
  title: string,
  content: string,
  show: boolean
}

interface DialogConfirmProps {
  onClose?: () => any
  onConfirm?: () => any
};

interface SetMessage {
  (title: string, content: string): void
}

const useDialogConfirm = (): [React.FC<DialogConfirmProps>, SetMessage, () => void] => {
  const { t } =  useTranslation();
  const [msg, showMessage] = useState({
    title: '',
    content: '',
    show: false
  } as message);
  const closeDialog = (callback?: () => any) => {
    showMessage({ ...msg, show: false });
    callback && callback();
  };
  const showDialog = (title: string, content: string) => {
    showMessage({ title, content, show: true });
  };

  return [
    ((props) =>
      (<AdaptiveDialog open={msg.show} onClose={() => closeDialog(props.onClose)}>
        <DialogTitle>{msg.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{msg.content}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeDialog(props.onConfirm)} color="primary">
            {t('ok')}
          </Button>
          <Button onClick={() => closeDialog(props.onClose)} autoFocus>
            {t('cancel')}
          </Button>
        </DialogActions>
      </AdaptiveDialog>)
    ),
    showDialog,
    closeDialog
  ];
};

export default useDialogConfirm;
