import React from 'react';
import { ListItem, ListItemText } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Rule } from 'rc-field-form/es/interface';


interface RestoreProps {
  rules?: Rule[] | undefined;
  restoreConfiguration: () => void
}

const Restore: React.FC<RestoreProps> = ({
  rules,
  restoreConfiguration,
}) => {
  const { t } = useTranslation();

  return (
    <ListItem button onClick={() => restoreConfiguration()}>
      <ListItemText primary={t('restore')} />
    </ListItem>
  )
}

export default Restore;
