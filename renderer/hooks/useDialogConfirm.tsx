/**
  * @name nojsja
  * @description ConfirmDialog Component based on MUI Dialog
  */
import React, { useContext, useRef, useState } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  DialogProps
} from "@material-ui/core";
import { useTranslation } from 'react-i18next';

import { AdaptiveDialog } from '@renderer/components/Pices/Dialog';

type OpenDialogOptions = {
  dialogProps?: Omit<DialogProps, 'open'>;
  dialogStyles?: React.CSSProperties;
} & DialogConfirmProps & Partial<Omit<DialogConfirmMessage, 'show'>>;
type OpenDialogFunc = (options: OpenDialogOptions) => void;

interface DialogConfirmMessage {
  title: React.ReactNode;
  content: React.ReactNode;
  show: boolean;
}

interface DialogConfirmProps {
  onClose?: () => void;
  onConfirm?: () => void;
}

interface DialogConfirmContext {
  openDialog: OpenDialogFunc;
}

const DialogConfirmContext = React.createContext<DialogConfirmContext>({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  openDialog: () => {},
});

export const DialogConfirmProvider: React.FC<{ children: React.ReactNode }> = (props) => {
  const [{ title, content, show }, showMessage] = useState<Partial<DialogConfirmMessage> & { show: boolean }>({
    title: '',
    content: '',
    show: false,
  });
  const [dialogProps, setDialogProps] = useState<Omit<DialogProps, 'open'> | null>(null);
  const [dialogStyles, setDialogStyles] = useState<React.CSSProperties>({});
  const { t } =  useTranslation();
  const onConfirmRef = useRef<DialogConfirmProps['onConfirm']>();
  const onCloseRef = useRef<DialogConfirmProps['onClose']>();

  const handleClose = () => {
    showMessage({ show: false });
    setTimeout(() => {
      setDialogProps(null);
      setDialogStyles({});
    }, 1e3);
  };

  const handleOpen = (options: Omit<DialogConfirmMessage, 'show'>) => {
    showMessage({ ...options, show: true });
  };

  const onCloseDialog = () => {
    onCloseRef.current?.();
    handleClose();
  };

  const onConfirmDialog = () => {
    onConfirmRef.current?.();
    handleClose();
  };

  const openDialog: OpenDialogFunc = (options) => {
    const {
      onConfirm,
      onClose,
      dialogProps,
      dialogStyles,
      ...others
    } = options;

    onConfirmRef.current = onConfirm;
    onCloseRef.current = onClose;
    setDialogProps(dialogProps || null);
    setDialogStyles(dialogStyles ?? {});
    handleOpen({
      title: '',
      content: '',
      ...others,
    });
  };

  return (
    <DialogConfirmContext.Provider
      value={{
        openDialog
      }}
    >
      {
        props.children
      }
      <AdaptiveDialog
        open={show}
        onClose={onCloseDialog}
        fullWidth
        maxWidth="sm"
        {...(dialogProps || {})}
        style={dialogStyles}
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{content}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onConfirmDialog} color="primary">
            {t('ok')}
          </Button>
          <Button onClick={onCloseDialog} autoFocus>
            {t('cancel')}
          </Button>
        </DialogActions>
      </AdaptiveDialog>
    </DialogConfirmContext.Provider>
  );
};

export const useDialogConfirm = (): [OpenDialogFunc] => {
  const { openDialog } = useContext(DialogConfirmContext);

  return [openDialog];
};

export default useDialogConfirm;
