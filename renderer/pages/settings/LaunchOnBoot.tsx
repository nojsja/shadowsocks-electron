import React from 'react';
import { ListItem, ListItemText, ListItemSecondaryAction } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Controller, UseFormReturn } from 'react-hook-form';

import { AdaptiveSwitch } from "../../components/Pices/Switch";
import { Settings } from '../../types';

interface LaunchOnBoolProps {
  form: UseFormReturn<Settings>;
}

const LaunchOnBoot: React.FC<LaunchOnBoolProps> = ({ form }) => {
  const { t } = useTranslation();

  return (
    <ListItem>
      <ListItemText
        primary={t('launch_on_boot')}
        secondary={t('not_applicable_to_linux_snap_application')}
      />
      <ListItemSecondaryAction>
        <Controller
          control={form.control}
          name="autoLaunch"
          render={({ field: { value, ...other } }) => (
            <AdaptiveSwitch
              {...other}
              checked={value ?? false}
              edge="end"
            />
          )}
        />
      </ListItemSecondaryAction>
    </ListItem>
  )
}

export default LaunchOnBoot;
