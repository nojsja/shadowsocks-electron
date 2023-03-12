import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  TextField,
} from '@material-ui/core';
import { Controller, UseFormReturn } from 'react-hook-form';
import { MessageChannel } from 'electron-re';

import { AdaptiveSwitch } from '@renderer/components/Pices/Switch';
import { TextWithTooltip } from '@renderer/components/Pices/TextWithTooltip';

import { useStylesOfSettings as useStyles } from '@renderer/pages/styles';
import If from '@renderer/components/HOC/IF';
import { Settings } from '@renderer/types';

const MAX_PORT = 65535;
const MIN_PORT = 1024;

interface HttpProxyProps {
  form: UseFormReturn<Settings>;
}

const HttpProxy: React.FC<HttpProxyProps> = ({ form }) => {
  const { t } = useTranslation();
  const styles = useStyles();
  const enable = form.watch('httpProxy.enable');
  const port = form.watch('httpProxy.port');
  const {
    formState: { errors },
  } = form;

  const onEnableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    MessageChannel.invoke('main', 'service:ai', {
      action: 'setAIProxy',
      params: {
        enabled: checked,
      },
    });
  };

  useEffect(() => {
    if (port <= 0) {
      form.setValue('httpProxy.port', MIN_PORT);
    }
    if (port > MAX_PORT) {
      form.setValue('httpProxy.port', MAX_PORT);
    }
  }, [port]);

  return (
    <>
      <ListItem>
        <ListItemText
          primary={
            <TextWithTooltip
              text={t('http_proxy')}
              tooltip={t('restart_when_changed')}
            />
          }
        />
        <ListItemSecondaryAction>
          <Controller
            control={form.control}
            name="httpProxy.enable"
            render={({ field: { value, ...other } }) => (
              <AdaptiveSwitch {...other} checked={value ?? false} edge="end" />
            )}
          />
        </ListItemSecondaryAction>
      </ListItem>
      <If
        condition={enable}
        then={
          <ListItem className={styles.listItemSub}>
            <ListItemText primary={`├── ${t('http_proxy_port')}`} />
            <ListItemSecondaryAction>
              <TextField
                className={`${styles.textField} ${styles.indentInput}`}
                {...form.register('httpProxy.port', {
                  min: 1024,
                  max: 65535,
                  validate: (value, record) => {
                    const httpPort = +value;
                    const pacPort = +record.pacPort;
                    const localPort = +record.localPort;
                    const num = localPort ^ pacPort ^ httpPort;
                    return (
                      (num !== localPort &&
                        num !== pacPort &&
                        num !== httpPort) ||
                      t('the_same_port_is_not_allowed')
                    );
                  },
                })}
                required
                error={!!errors.httpProxy?.port}
                helperText={
                  !!errors.httpProxy?.port &&
                  (errors.httpProxy?.port?.message || t('invalid_value'))
                }
                size="small"
                type="number"
                placeholder={t('http_proxy_port')}
              />
            </ListItemSecondaryAction>
          </ListItem>
        }
      />
      <If
        condition={enable}
        then={
          <ListItem className={styles.listItemSub}>
            <ListItemText primary={`└── ${t('proxy_for_open_ai')}`} />
            <ListItemSecondaryAction>
              <Controller
                control={form.control}
                name="httpProxy.enableAIProxy"
                render={({ field: { value, onChange, ...other } }) => (
                  <AdaptiveSwitch
                    {...other}
                    checked={value ?? false}
                    onChange={(e) => {
                      onEnableChange(e);
                      onChange(e);
                    }}
                    edge="end"
                  />
                )}
              />
            </ListItemSecondaryAction>
          </ListItem>
        }
      />
    </>
  );
};

export default HttpProxy;
