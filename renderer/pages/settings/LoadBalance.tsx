import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  TextField,
  Select,
  MenuItem,
} from "@material-ui/core";
import { Controller, UseFormReturn } from 'react-hook-form';

import { AdaptiveSwitch } from '../../components/Pices/Switch';
import If from '../../components/HOC/IF';
import { TextWithTooltip } from '../../components/Pices/TextWithTooltip';

import { useStylesOfSettings as useStyles } from '../styles';
import { ALGORITHM, Settings } from '../../types';

const LOADBALANCE_MAX_NODES = 10;
const LOADBALANCE_MIN_NODES = 1;

interface LoadBalanceProps {
  form: UseFormReturn<Settings>;
}

const LoadBalance: React.FC<LoadBalanceProps> = ({
  form
}) => {
  const { t } = useTranslation();
  const styles = useStyles();
  const enable = form.watch('loadBalance.enable');
  const count = form.watch('loadBalance.count');

  useEffect(() => {
    if (count < LOADBALANCE_MIN_NODES) {
      form.setValue('loadBalance.count', LOADBALANCE_MIN_NODES);
    }
    if (count > LOADBALANCE_MAX_NODES) {
      form.setValue('loadBalance.count', LOADBALANCE_MAX_NODES);
    }
  }, [count]);

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
          <Controller
            control={form.control}
            name="loadBalance.enable"
            render={({ field }) => (
              <AdaptiveSwitch
                edge="end"
                checked={field.value}
              />
            )}
          />
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
              <TextField
                className={`${styles.textField} ${styles.indentInput}`}
                {
                  ...form.register('loadBalance.count', { required: true })
                }
                required
                onChange={(e) => e.target.value?.trim()}
                size="small"
                type="number"
              />
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
              <Select
                {
                ...form.register('loadBalance.strategy', { required: true })
                }
              >
                <MenuItem value={ALGORITHM.POLLING}>{t('polling')}</MenuItem>
                <MenuItem value={ALGORITHM.RANDOM}>{t('random')}</MenuItem>
              </Select>
            </ListItemSecondaryAction>
          </ListItem>
        }
      />
    </>
  )
}

export default LoadBalance;
