import React from 'react';
import { ListItem, ListItemText } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Rule } from 'rc-field-form/es/interface';
import { MessageChannel } from 'electron-re';

import { TextWithTooltip } from '../../components/Pices/TextWithTooltip';

const handleOpenLog = async () => {
  await MessageChannel.invoke('main', 'service:desktop', {
    action: 'openPluginsDir',
    params: {}
  });
};


interface OpenPluginsDirProps {
  rules?: Rule[] | undefined;
}

const OpenPluginsDir: React.FC<OpenPluginsDirProps> = ({
  rules,
}) => {
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
