import React from 'react';
import { ListItem, ListItemText } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import { restoreConfigurationFromFile } from '../../redux/actions/config';
import { useTypedDispatch } from "../../redux/actions";
import { UseFormReturn } from 'react-hook-form';
import { Settings } from '../../types';

interface RestoreProps {
  // rules?: Rule[] | undefined;
  form: UseFormReturn<Settings>,
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
          form.reset(data.settings ?? {})
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
