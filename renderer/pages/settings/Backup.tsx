import React from 'react';
import { ListItem, ListItemText } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import { backupConfigurationToFile } from '../../redux/actions/config';
import { useTypedSelector } from "../../redux/reducers";
import { useTypedDispatch } from "../../redux/actions";

const Backup: React.FC = () => {
  const { t } = useTranslation();
  const settings = useTypedSelector(state => state.settings);
  const config = useTypedSelector(state => state.config);
  const dispatch = useTypedDispatch();

  const backupConfiguration = () => {
    return dispatch<any>(
      backupConfigurationToFile({
        config,
        settings
      }, {
        success: t('successful_operation'),
        error: {
          default: t('failed_operation'),
          404: t('user_canceled')
        }
      })
    );
  };

  return (
    <ListItem button onClick={backupConfiguration}>
      <ListItemText primary={t('backup')} />
    </ListItem>
  )
}

export default Backup;
