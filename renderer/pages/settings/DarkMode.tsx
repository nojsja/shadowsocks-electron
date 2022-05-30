import React from 'react';
import { Field } from "rc-field-form";
import { ListItem, ListItemText, ListItemSecondaryAction } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Rule } from 'rc-field-form/es/interface';

import { AdaptiveSwitch } from "../../components/Pices/Switch";

interface DarkModeProps {
  rules?: Rule[] | undefined;
  disabled: boolean;
}

const DarkMode: React.FC<DarkModeProps> = ({
  rules,
  disabled
}) => {
  const { t } = useTranslation();

  return (
    <ListItem>
      <ListItemText
        primary={t('darkMode')}
      />
      <ListItemSecondaryAction>
        <Field name="darkMode" valuePropName="checked">
          <AdaptiveSwitch
            edge="end"
            disabled={disabled}
          />
        </Field>
      </ListItemSecondaryAction>
    </ListItem>
  )
}

export default DarkMode;
