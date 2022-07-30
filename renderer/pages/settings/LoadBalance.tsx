import React from 'react';
import Form, { Field } from "rc-field-form";
import { useTranslation } from 'react-i18next';
import { FormInstance, Rule } from 'rc-field-form/es/interface';
import {
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  TextField,
  Select,
  MenuItem,
} from "@material-ui/core";

import { AdaptiveSwitch } from "../../components/Pices/Switch";
import If from "../../components/HOC/IF";
import { TextWithTooltip } from '../../components/Pices/TextWithTooltip';

import { useStylesOfSettings as useStyles } from "../styles";
import { ALGORITHM } from '../../types';

interface LoadBalanceProps {
  rules?: Rule[] | undefined;
  form: FormInstance<any>
}

const LoadBalance: React.FC<LoadBalanceProps> = ({
  rules,
  form
}) => {
  const { t } = useTranslation();
  const styles = useStyles();
  const enable = Form.useWatch(['loadBalance', 'enable'], form);

  return (
    <>
      <ListItem>
        <ListItemText
          primary={
            <TextWithTooltip
              text={t('load_balance')}
              tooltip={t('only_for_server_groups')}
            />
          }
          secondary={t('unstable_feature')}
        />
        <ListItemSecondaryAction>
          <Field name={['loadBalance', 'enable']} valuePropName="checked">
            <AdaptiveSwitch
              edge="end"
            />
          </Field>
        </ListItemSecondaryAction>
      </ListItem>
      <If
        condition={enable}
        then={
          <ListItem className={styles.sub}>
            <ListItemText
              primary={
                <TextWithTooltip
                  text={`↳ ${t('nodes_count_limit')}`}
                  tooltip={t('load_balance_tips')}
                />
              }
            />
            <ListItemSecondaryAction>
              <Field
                name={['loadBalance', 'count']}
                rules={rules}
                normalize={(value: string) => +(value.trim())}
                validateTrigger={false}
              >
                <TextField
                  className={`${styles.textField} ${styles.indentInput}`}
                  required
                  size="small"
                  type="number"
                />
              </Field>
            </ListItemSecondaryAction>
          </ListItem>
        }
      />
      <If
        condition={enable}
        then={
          <ListItem className={styles.sub}>
            <ListItemText
              primary={
                <TextWithTooltip
                  text={`↳ ${t('load_balance_strategy')}`}
                  tooltip={
                    <div>
                      <div>{t('polling')} - {t('polling_tips')}</div>
                      <div>{t('random')} - {t('random_tips')}</div>
                    </div>
                  }
                />
              }
            />
            <ListItemSecondaryAction>
              <Field
                name={['loadBalance', 'strategy']}
                validateTrigger={false}
              >
                <Select
                >
                  <MenuItem value={ALGORITHM.POLLING}>{t('polling')}</MenuItem>
                  <MenuItem value={ALGORITHM.RANDOM}>{t('random')}</MenuItem>
                </Select>
              </Field>
            </ListItemSecondaryAction>
          </ListItem>
        }
      />
    </>
  )
}

export default LoadBalance;
