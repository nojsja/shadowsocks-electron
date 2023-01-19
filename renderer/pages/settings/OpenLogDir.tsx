import React from 'react';
import { ListItem, ListItemText } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { MessageChannel } from 'electron-re';

const handleOpenLog = async () => {
  await MessageChannel.invoke('main', 'service:desktop', {
    action: 'openLogDir',
    params: {}
  });
};

const OpenLogDir: React.FC = () => {
  const { t } = useTranslation();

  return (
    <ListItem button onClick={handleOpenLog}>
      <ListItemText primary={t('open_log_dir')} />
    </ListItem>
  )
}

export default OpenLogDir;
