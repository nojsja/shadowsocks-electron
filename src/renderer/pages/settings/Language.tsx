import React from 'react';
import { MessageChannel } from 'electron-re';
import { ListItem, ListItemText, ListItemSecondaryAction, MenuItem, Select } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import { getDefaultLang } from "../../utils";
import { persistStore } from "../../App";
import { getFirstLanguage } from "../../i18n";
import { Settings } from '../../types';
import { UseFormReturn } from 'react-hook-form';

interface LanguageProps {
  form: UseFormReturn<Settings>;
}

const onLangChange = (e: React.ChangeEvent<{ name?: string | undefined, value: unknown; }>) => {
  if (persistStore.get('lang') === e.target.value) return;
  persistStore.set('lang', e.target.value as string);
  MessageChannel.invoke('main', 'service:desktop', {
    action: 'reloadMainWindow',
    params: {}
  });
  MessageChannel.invoke('main', 'service:desktop', {
    action: 'setLocale',
    params: getFirstLanguage(e.target.value as string)
  });
}

const Language: React.FC<LanguageProps> = () => {
  const { t } = useTranslation();

  return (
    <ListItem>
      <ListItemText
        primary={'Language'}
      />
      <ListItemSecondaryAction>
        <Select
          value={getDefaultLang()}
          onChange={onLangChange}
        >
          <MenuItem value={'en-US'}>{t('langEnglish')}</MenuItem>
          <MenuItem value={'zh-CN'}>{t('langZhong')}</MenuItem>
          <MenuItem value={'ru-RU'}>{t('langRussian')}</MenuItem>
        </Select>
      </ListItemSecondaryAction>
    </ListItem>
  )
}

export default Language;
