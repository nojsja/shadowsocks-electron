import React from 'react';
import { ListItem, ListItemText } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { MessageChannel } from 'electron-re';

const handleOpenProcessManager = async () => {
  await MessageChannel.invoke('main', 'service:desktop', {
    action: 'openProcessManager',
    params: {}
  });
};

const OpenProcessManager: React.FC = () => {
  const { t } = useTranslation();

  return (
    <ListItem button onClick={handleOpenProcessManager}>
      <ListItemText primary={t('open_process_manager')} />
    </ListItem>
  )
}

export default OpenProcessManager;
