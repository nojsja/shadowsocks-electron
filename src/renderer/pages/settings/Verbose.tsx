import React from 'react';
import { ListItem, ListItemText, ListItemSecondaryAction } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Controller, UseFormReturn } from 'react-hook-form';

import { AdaptiveSwitch } from '../../components/Pices/Switch';
import { Settings } from '../../types';

interface VerboseProps {
  form: UseFormReturn<Settings>;
}

const Verbose: React.FC<VerboseProps> = ({ form }) => {
  const { t } = useTranslation();

  return (
    <ListItem>
      <ListItemText
        primary="Verbose"
        secondary={t('verbose_output')}
      />
      <ListItemSecondaryAction>
        <Controller
          control={form.control}
          name="verbose"
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

export default Verbose;
