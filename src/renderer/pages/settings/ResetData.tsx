import React from 'react';
import { ListItem, ListItemText } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { MessageChannel } from 'electron-re';
import { UseFormReturn } from 'react-hook-form';

import { useTypedDispatch } from '@renderer/redux/actions';
import { CLEAR_STORE } from '@renderer/redux/reducers';
import { Message } from '@renderer/hooks/useNotifier';
import useDialogConfirm from '@renderer/hooks/useDialogConfirm';
import { Settings } from '@renderer/types';
import defaultStore from '@renderer/redux/defaultStore';

interface ResetDataProps {
  form: UseFormReturn<Settings>;
}

const ResetData: React.FC<ResetDataProps> = ({
  form,
}) => {
  const { t } = useTranslation();
  const [openDialog] = useDialogConfirm();
  const dispatch = useTypedDispatch();

  const handleAlertDialogOpen = () => {
    openDialog({
      title: t('reset_all_data'),
      content: t('reset_all_data_tips'),
      onConfirm() {
        dispatch({type: CLEAR_STORE} as any);
        form.reset(defaultStore.settings);
        MessageChannel.invoke('main', 'service:main', {
          action: 'stopClient',
          params: {}
        });
        Message.success(t('cleared_all_data'));
      },
    });
  };


  return (
    <>
      <ListItem button onClick={handleAlertDialogOpen}>
        <ListItemText primary={t('reset_data')} />
      </ListItem>
    </>
  )
}

export default ResetData;
