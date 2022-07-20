import React from 'react';
import { ListItem, ListItemText } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Rule } from 'rc-field-form/es/interface';
import { MessageChannel } from 'electron-re';
import { SnackbarMessage } from 'notistack';
import { FormInstance } from 'rc-field-form';

import useDialogConfirm from '../../hooks/useDialogConfirm';
import { useTypedDispatch } from "../../redux/actions";
import { CLEAR_STORE } from "../../redux/reducers";
import { Notification } from "../../types";
import defaultStore from '../../redux/defaultStore';

interface ResetDataProps {
  rules?: Rule[] | undefined;
  enqueueSnackbar: (message: SnackbarMessage, options: Notification) => void;
  form: FormInstance<any>;
}

const ResetData: React.FC<ResetDataProps> = ({
  form,
  enqueueSnackbar
}) => {
  const { t } = useTranslation();
  const [DialogConfirm, showDialog, closeDialog] = useDialogConfirm();
  const dispatch = useTypedDispatch();

  const handleReset = () => {
    dispatch({
      type: CLEAR_STORE
    } as any);
    MessageChannel.invoke('main', 'service:main', {
      action: 'stopClient',
      params: {}
    });
    closeDialog();
    form.setFieldsValue(defaultStore.settings);
    enqueueSnackbar(t('cleared_all_data'), { variant: 'success' });
  };

  const handleAlertDialogOpen = () => {
    showDialog(t('reset_all_data'), t('reset_all_data_tips'));
  };


  return (
    <>
      <ListItem button onClick={handleAlertDialogOpen}>
        <ListItemText primary={t('reset_data')} />
      </ListItem>
      <DialogConfirm onClose={closeDialog} onConfirm={handleReset} />
    </>
  )
}

export default ResetData;
