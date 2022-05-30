import React from 'react';
import { ListItem, ListItemText, ListItemSecondaryAction } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Rule } from 'rc-field-form/es/interface';
import { Field } from "rc-field-form";

import { AdaptiveSwitch } from "../../components/Pices/Switch";

interface VerboseProps {
  rules?: Rule[] | undefined;
}

const Verbose: React.FC<VerboseProps> = ({
  rules,
}) => {
  const { t } = useTranslation();

  return (
    <ListItem>
      <ListItemText
        primary="Verbose"
        secondary={t('verbose_output')}
      />
      <ListItemSecondaryAction>
        <Field name="verbose" valuePropName="checked">
          <AdaptiveSwitch
            edge="end"
          />
        </Field>
      </ListItemSecondaryAction>
    </ListItem>
  )
}

export default Verbose;
