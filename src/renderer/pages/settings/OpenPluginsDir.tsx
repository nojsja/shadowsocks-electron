import React from 'react';
import { ListItem, ListItemText } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { MessageChannel } from 'electron-re';

import { TextWithTooltip } from '../../components/Pices/TextWithTooltip';

const handleOpenLog = async () => {
  await MessageChannel.invoke('main', 'service:desktop', {
    action: 'openPluginsDir',
    params: {}
  });
};

const OpenPluginsDir: React.FC = () => {
  const { t } = useTranslation();

  return (
    <ListItem button onClick={handleOpenLog}>
      <ListItemText
        primary={
          <TextWithTooltip
            text={t('open_plugins_dir')}
            tooltip={t('plugins_dir_tips')}
          />
        }
      />
    </ListItem>
  )
}

export default OpenPluginsDir;
