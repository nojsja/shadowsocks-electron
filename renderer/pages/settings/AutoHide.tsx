import React from 'react';
import { ListItem, ListItemText, ListItemSecondaryAction } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import { AdaptiveSwitch } from "../../components/Pices/Switch";
import { Settings } from '../../types';
import { Controller, UseFormReturn } from 'react-hook-form';

interface AutoHideProps {
  // rules?: Rule[] | undefined;
  form: UseFormReturn<Settings>;
}

const AutoHide: React.FC<AutoHideProps> = () => {
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
          render={({ field }) => (
            <AdaptiveSwitch
              edge="end"
              checked={field.value}
            />
          )}
        />
      </ListItemSecondaryAction>
    </ListItem>
  )
}

export default AutoHide;
