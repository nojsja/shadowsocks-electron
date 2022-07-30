import React from 'react';
import { Field } from "rc-field-form";
import { TextField, Tooltip } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Rule } from 'rc-field-form/es/interface';

import { useStylesOfSettings as useStyles } from "../styles";

interface PacPortProps {
  rules?: Rule[] | undefined;
}

const PacPort: React.FC<PacPortProps> = ({
  rules,
}) => {
  const { t } = useTranslation();
  const styles = useStyles();

  return (
    <Field
      name="pacPort"
      rules={rules}
      normalize={(value: string) => +(value.trim())}
      validateTrigger={false}
    >
      <TextField
        className={styles.textField}
        required
        fullWidth
        type="number"
        size="small"
        label={
          <Tooltip arrow placement="right" title={t('pac_port_tips') as string}>
            <span>
              { t('pac_port') }
            </span>
          </Tooltip>
        }
      />
    </Field>
  )
}

export default PacPort;
