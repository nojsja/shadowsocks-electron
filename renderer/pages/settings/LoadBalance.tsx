import React from 'react';
import { Field } from "rc-field-form";
import { useTranslation } from 'react-i18next';
import { Rule } from 'rc-field-form/es/interface';
import {
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  TextField
} from "@material-ui/core";

import { AdaptiveSwitch } from "../../components/Pices/Switch";
import If from "../../components/HOC/IF";

import { useStylesOfSettings as useStyles } from "../styles";

interface LoadBalanceProps {
  rules?: Rule[] | undefined;
  enable: boolean
}

const LoadBalance: React.FC<LoadBalanceProps> = ({
  rules,
  enable
}) => {
  const { t } = useTranslation();
  const styles = useStyles();

  return (
    <>
      <ListItem>
        <ListItemText
          primary={t('load_balance')}
        />
        <ListItemSecondaryAction>
          <Field name="loadBanlance" valuePropName="checked">
            <AdaptiveSwitch
              edge="end"
            />
          </Field>
        </ListItemSecondaryAction>
      </ListItem>
      <If
        condition={enable}
        then={
          <ListItem>
            <ListItemText
              primary={t('http_proxy_port')}
              secondary={t('unstable_feature')}
            />
            <ListItemSecondaryAction>
              <Field
                name="nodes_count_limit"
                rules={rules}
                normalize={(value: string) => +(value.trim())}
                validateTrigger={false}
              >
                <TextField
                  className={`${styles.textField} ${styles.indentInput}`}
                  required
                  size="small"
                  type="number"
                  placeholder={t('nodes_count_limit')}
                />
              </Field>
            </ListItemSecondaryAction>
          </ListItem>
        }
      />
    </>
  )
}

export default LoadBalance;
