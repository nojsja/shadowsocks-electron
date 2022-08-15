import React from 'react';
import { ListItem, ListItemText } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Rule } from 'rc-field-form/es/interface';
import { FormInstance } from 'rc-field-form';

import { restoreConfigurationFromFile } from '../../redux/actions/config';
import { useTypedDispatch } from "../../redux/actions";

interface RestoreProps {
  rules?: Rule[] | undefined;
  form: FormInstance<any>,
}

const Restore: React.FC<RestoreProps> = ({
  form,
}) => {
  const { t } = useTranslation();
  const dispatch = useTypedDispatch();

  const restoreConfiguration = () => {
    dispatch<any>(
      restoreConfigurationFromFile(
        {
          success: t('the_recovery_is_successful'),
          error: {
            default: t('the_recovery_is_failed'),
            404: t('user_canceled')
          }
        },
        (data) => {
          form.setFieldsValue(data.settings ?? {});
        }
    ));
  }

  return (
    <ListItem button onClick={() => restoreConfiguration()}>
      <ListItemText primary={t('restore')} />
    </ListItem>
  )
}

export default Restore;
