import React from 'react';
import { ListItem, ListItemText, ListItemSecondaryAction } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import { AdaptiveSwitch } from '../../components/Pices/Switch';
import { Settings } from '../../types';
import { Controller, UseFormReturn } from 'react-hook-form';

interface FixedMenuProps {
  form: UseFormReturn<Settings>;
}

const FixedMenu: React.FC<FixedMenuProps> = ({ form }) => {
  const { t } = useTranslation();

  return (
    <ListItem>
      <ListItemText
        primary={t('fixed_menu')}
      />
      <ListItemSecondaryAction>
        <Controller
          control={form.control}
          name="fixedMenu"
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

export default FixedMenu;
