import React from 'react';
import { TextField, Tooltip } from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import { useStyles } from './style';
import { UseFormReturn } from 'react-hook-form';
import { Settings } from '../../types';

interface PacPortProps {
  form: UseFormReturn<Settings>;
}

const PacPort: React.FC<PacPortProps> = ({ form }) => {
  const { t } = useTranslation();
  const styles = useStyles();
  const {
    formState: { errors },
  } = form;

  return (
    <TextField
      className={styles.textField}
      {...form.register('pacPort', {
        required: true,
        min: 1024,
        max: 65535,
        validate: (value, record) => {
          const pacPort = +value;
          const localPort = +record.localPort;
          const httpPort = +record.httpProxy?.port;
          const num = localPort ^ pacPort ^ httpPort;
          return (
            (num !== localPort && num !== pacPort && num !== httpPort) ||
            t('the_same_port_is_not_allowed')
          );
        },
      })}
      required
      fullWidth
      type="number"
      size="small"
      error={!!errors.pacPort}
      helperText={
        !!errors.pacPort && (errors.pacPort?.message || t('invalid_value'))
      }
      label={
        <Tooltip arrow placement="right" title={t('pac_port_tips') as string}>
          <span>{t('pac_port')}</span>
        </Tooltip>
      }
    />
  );
};

export default PacPort;
