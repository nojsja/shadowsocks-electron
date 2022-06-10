import React from 'react';
import { Field } from "rc-field-form";
import { useTranslation } from 'react-i18next';
import { Rule } from 'rc-field-form/es/interface';
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
  enable: boolean;
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
          primary={
            <TextWithTooltip
              text={t('load_balance')}
              tooltip={t('only_for_server_groups')}
            />
          }
          secondary={t('unstable_feature')}
        />
        <ListItemSecondaryAction>
          <Field name="loadBalance" valuePropName="checked">
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
                name="loadBalanceCount"
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
                name="loadBalanceStrategy"
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
