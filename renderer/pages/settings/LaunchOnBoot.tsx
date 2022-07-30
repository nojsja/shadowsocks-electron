import React from 'react';
import { Field } from "rc-field-form";
import { ListItem, ListItemText, ListItemSecondaryAction } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Rule } from 'rc-field-form/es/interface';

import { AdaptiveSwitch } from "../../components/Pices/Switch";

interface LaunchOnBoolProps {
  rules?: Rule[] | undefined;
}

const LaunchOnBoot: React.FC<LaunchOnBoolProps> = ({
  rules,
}) => {
  const { t } = useTranslation();

  return (
    <ListItem>
      <ListItemText
        primary={t('launch_on_boot')}
        secondary={t('not_applicable_to_linux_snap_application')}
      />
      <ListItemSecondaryAction>
        <Field name="autoLaunch" valuePropName="checked">
          <AdaptiveSwitch
            edge="end"
          />
        </Field>
      </ListItemSecondaryAction>
    </ListItem>
  )
}

export default LaunchOnBoot;
