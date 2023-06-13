import React from 'react';
import { TextField, Tooltip } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';

import { useStyles } from './style';
import { Settings } from '../../types';

interface LocalPortProps {
  form: UseFormReturn<Settings>;
}

const LocalPort: React.FC<LocalPortProps> = ({ form }) => {
  const { t } = useTranslation();
  const styles = useStyles();
  const {
    formState: { errors },
  } = form;

  return (
    <TextField
      className={styles.textField}
      {...form.register('localPort', {
        required: true,
        min: 1024,
        max: 65535,
        validate: (value, record) => {
          const localPort = +value;
          const pacPort = +record.pacPort;
          const httpPort = +record.httpProxy?.port;
          const num = localPort ^ pacPort ^ httpPort;
          return (
            (num !== localPort && num !== pacPort && num !== httpPort) ||
            t('the_same_port_is_not_allowed')
          );
        },
      })}
      required
      error={!!errors.localPort}
      helperText={
        !!errors.localPort && (errors.localPort?.message || t('invalid_value'))
      }
      fullWidth
      size="small"
      type="number"
      label={
        <Tooltip arrow placement="right" title={t('local_port_tips') as string}>
          <span>{t('local_port')}</span>
        </Tooltip>
      }
    />
  );
};

export default LocalPort;
