import React from 'react';
import { Field } from "rc-field-form";
import { TextField, Tooltip } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Rule } from 'rc-field-form/es/interface';

import { useStylesOfSettings as useStyles } from "../styles";

interface LocalPortProps {
  rules?: Rule[] | undefined;
}

const LocalPort: React.FC<LocalPortProps> = ({
  rules,
}) => {
  const { t } = useTranslation();
  const styles = useStyles();

  return (
    <Field
      name="localPort"
      rules={rules}
      normalize={(value: string) => +(value.trim())}
      validateTrigger={false}
    >
      <TextField
        className={styles.textField}
        required
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
    </Field>
  )
}

export default LocalPort;
