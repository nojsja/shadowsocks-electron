import React from 'react';
import { ListItem, ListItemText } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Rule } from 'rc-field-form/es/interface';


interface ResetDataProps {
  rules?: Rule[] | undefined;
  handleAlertDialogOpen: () => void
}

const ResetData: React.FC<ResetDataProps> = ({
  rules,
  handleAlertDialogOpen,
}) => {
  const { t } = useTranslation();

  return (
    <ListItem button onClick={handleAlertDialogOpen}>
      <ListItemText primary={t('reset_data')} />
    </ListItem>
  )
}

export default ResetData;
