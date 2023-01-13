import React from 'react';
import { TextField, Tooltip } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import { useStylesOfSettings as useStyles } from '../styles';
import { UseFormReturn } from 'react-hook-form';
import { Settings } from '../../types';

interface PacPortProps {
  form: UseFormReturn<Settings>;
}

const PacPort: React.FC<PacPortProps> = ({
  form,
}) => {
  const { t } = useTranslation();
  const styles = useStyles();

  return (
      <TextField
        className={styles.textField}
        {
          ...form.register('pacPort', {
            required: true,
          })
        }
        required
        fullWidth
        type="number"
        size="small"
        onChange={(e) => +(e.target.value.trim())}
        label={
          <Tooltip arrow placement="right" title={t('pac_port_tips') as string}>
            <span>
              { t('pac_port') }
            </span>
          </Tooltip>
        }
      />
  )
}

export default PacPort;
