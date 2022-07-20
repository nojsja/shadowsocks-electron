import React from 'react';
import Form, { Field } from "rc-field-form";
import { ListItem, ListItemText, ListItemSecondaryAction } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { FormInstance, Rule } from 'rc-field-form/es/interface';

import { AdaptiveSwitch } from "../../components/Pices/Switch";

interface DarkModeProps {
  rules?: Rule[] | undefined;
  form: FormInstance<any>
}

const DarkMode: React.FC<DarkModeProps> = ({
  form
}) => {
  const { t } = useTranslation();
  const autoTheme = Form.useWatch(['autoTheme'], form);

  return (
    <ListItem>
      <ListItemText
        primary={t('darkMode')}
      />
      <ListItemSecondaryAction>
        <Field name="darkMode" valuePropName="checked">
          <AdaptiveSwitch
            edge="end"
            disabled={autoTheme}
          />
        </Field>
      </ListItemSecondaryAction>
    </ListItem>
  )
}

export default DarkMode;
