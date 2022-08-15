import React from 'react';
import { Field } from "rc-field-form";
import { ListItem, ListItemText, ListItemSecondaryAction } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Rule } from 'rc-field-form/es/interface';

import { AdaptiveSwitch } from "../../components/Pices/Switch";

interface FixedMenuProps {
  rules?: Rule[] | undefined;
}

const FixedMenu: React.FC<FixedMenuProps> = () => {
  const { t } = useTranslation();

  return (
    <ListItem>
      <ListItemText
        primary={t('fixed_menu')}
      />
      <ListItemSecondaryAction>
        <Field name="fixedMenu" valuePropName="checked">
          <AdaptiveSwitch
            edge="end"
          />
        </Field>
      </ListItemSecondaryAction>
    </ListItem>
  )
}

export default FixedMenu;
