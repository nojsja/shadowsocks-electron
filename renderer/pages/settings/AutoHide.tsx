import React from 'react';
import { ListItem, ListItemText, ListItemSecondaryAction } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Controller, UseFormReturn } from 'react-hook-form';

import { AdaptiveSwitch } from "../../components/Pices/Switch";
import { Settings } from '../../types';

interface AutoHideProps {
  form: UseFormReturn<Settings>;
}

const AutoHide: React.FC<AutoHideProps> = ({ form }) => {
  const { t } = useTranslation();

  return (
    <ListItem>
      <ListItemText
        primary={t('auto_hide')}
        secondary={t('minimize_on_start')}
      />
      <ListItemSecondaryAction>
        <Controller
          name="autoHide"
          control={form.control}
          render={({ field: { value, ...other } }) => (
            <AdaptiveSwitch
              edge="end"
              {...other}
              checked={value ?? false}
            />
          )}
        />
      </ListItemSecondaryAction>
    </ListItem>
  )
}

export default AutoHide;
