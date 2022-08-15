import React from 'react';
import { Field } from "rc-field-form";
import { ListItem, ListItemText, ListItemSecondaryAction } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Rule } from 'rc-field-form/es/interface';

import { AdaptiveSwitch } from "../../components/Pices/Switch";

interface AutoHideProps {
  rules?: Rule[] | undefined;
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
        <Field name="autoHide" valuePropName="checked">
          <AdaptiveSwitch
            edge="end"
          />
        </Field>
      </ListItemSecondaryAction>
    </ListItem>
  )
}

export default AutoHide;
