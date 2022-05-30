import React from 'react';
import { Field } from "rc-field-form";
import { ListItem, ListItemText, ListItemSecondaryAction } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Rule } from 'rc-field-form/es/interface';

import { AdaptiveSwitch } from "../../components/Pices/Switch";

interface AutoThemeProps {
  rules?: Rule[] | undefined;
  onAutoThemeChange: (e: React.ChangeEvent<{ name?: string | undefined, checked: boolean; }>) => void
}

const AutoTheme: React.FC<AutoThemeProps> = ({
  rules,
  onAutoThemeChange
}) => {
  const { t } = useTranslation();

  return (
    <ListItem>
      <ListItemText
        primary={t('autoTheme')}
        secondary={t('autoThemeTips')}
      />
      <ListItemSecondaryAction>
        <Field name="autoTheme" valuePropName="checked">
          <AdaptiveSwitch
            edge="end"
            onChange={onAutoThemeChange}
          />
        </Field>
      </ListItemSecondaryAction>
    </ListItem>
  )
}

export default AutoTheme;
