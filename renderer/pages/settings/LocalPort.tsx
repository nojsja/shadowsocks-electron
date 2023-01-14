import React from 'react';
import { TextField, Tooltip } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';

import { useStylesOfSettings as useStyles } from '../styles';
import { Settings } from '../../types';

interface LocalPortProps {
  form: UseFormReturn<Settings>;
}

const LocalPort: React.FC<LocalPortProps> = ({
  form,
}) => {
  const { t } = useTranslation();
  const styles = useStyles();
  const { formState: { errors } } = form;

  return (
      <TextField
        className={styles.textField}
        {
          ...form.register('localPort', {
            required: true,
            min: 1024,
            max: 65535,
            validate: (value, record) => {
              const localPort = +value;
              const pacPort = +record.pacPort;
              const httpPort = +record.httpProxy?.port;
              const num = localPort ^ pacPort ^ httpPort;
              return (num !== localPort && num !== pacPort && num !== httpPort);
            },
          })
        }
        required
        error={!!errors.localPort}
        helperText={!!errors.localPort && t('invalid_value')}
        fullWidth
        size="small"
        type="number"
        label={
          <Tooltip arrow placement="right" title={t('local_port_tips') as string}>
            <span>
              { t('local_port') }
            </span>
          </Tooltip>
        }
      />
  )
}

export default LocalPort;
