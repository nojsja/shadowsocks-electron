import React from 'react';
import { ListItem, ListItemText, ListItemSecondaryAction } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import { AdaptiveSwitch } from '../../components/Pices/Switch';
import { Settings } from '../../types';
import { Controller, UseFormReturn } from 'react-hook-form';

interface AutoThemeProps {
  onAutoThemeChange: (e: React.ChangeEvent<{ name?: string | undefined, checked: boolean; }>) => void;
  form: UseFormReturn<Settings>;
}

const AutoTheme: React.FC<AutoThemeProps> = ({
  onAutoThemeChange,
  form,
}) => {
  const { t } = useTranslation();

  return (
    <ListItem>
      <ListItemText
        primary={t('autoTheme')}
        secondary={t('autoThemeTips')}
      />
      <ListItemSecondaryAction>
        <Controller
          control={form.control}
          name="autoTheme"
          render={({ field: { value, onChange, ...other } }) => (
            <AdaptiveSwitch
              edge="end"
              {...other}
              onChange={(e, checked) => {
                onAutoThemeChange(e);
                onChange(e, checked);
              }}
              checked={value ?? false}
            />
          )}
        />
      </ListItemSecondaryAction>
    </ListItem>
  )
}

export default AutoTheme;
