import React from 'react';
import { ListItem, ListItemText } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Rule } from 'rc-field-form/es/interface';


interface BackupProps {
  rules?: Rule[] | undefined;
  backupConfiguration: () => void
}

const Backup: React.FC<BackupProps> = ({
  rules,
  backupConfiguration,
}) => {
  const { t } = useTranslation();

  return (
    <ListItem button onClick={backupConfiguration}>
      <ListItemText primary={t('backup')} />
    </ListItem>
  )
}

export default Backup;
