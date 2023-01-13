import React from 'react';
import { ListItem, ListItemText, ListItemSecondaryAction } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import { AdaptiveSwitch } from "../../components/Pices/Switch";
import { Settings } from '../../types';
import { Controller, UseFormReturn } from 'react-hook-form';

interface DarkModeProps {
  form: UseFormReturn<Settings>;
}

const DarkMode: React.FC<DarkModeProps> = ({
  form
}) => {
  const { t } = useTranslation();
  const autoTheme = form.watch('autoTheme');

  return (
    <ListItem>
      <ListItemText
        primary={t('darkMode')}
      />
      <ListItemSecondaryAction>
        <Controller
          control={form.control}
          name="darkMode"
          render={({ field }) => (
            <AdaptiveSwitch
              edge="end"
              checked={field.value}
              disabled={autoTheme}
            />
          )}
        />
      </ListItemSecondaryAction>
    </ListItem>
  )
}

export default DarkMode;
