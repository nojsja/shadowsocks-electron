import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  TextField
} from "@material-ui/core";

import { AdaptiveSwitch } from '../../components/Pices/Switch';
import { TextWithTooltip } from '../../components/Pices/TextWithTooltip';

import { useStylesOfSettings as useStyles } from '../styles';
import If from '../../components/HOC/IF';
import { Settings } from '../../types';
import { Controller, UseFormReturn } from 'react-hook-form';

const MAX_PORT = 65535;
const MIN_PORT = 1024;

interface HttpProxyProps {
  form: UseFormReturn<Settings>;
}

const HttpProxy: React.FC<HttpProxyProps> = ({
  form,
}) => {
  const { t } = useTranslation();
  const styles = useStyles();
  const enable = form.watch('httpProxy.enable');
  const port = form.watch('httpProxy.port');
  const { formState: { errors } } = form;

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
              tooltip={
                t('restart_when_changed')
              }
            />
          }
        />
        <ListItemSecondaryAction>
          <Controller
            control={form.control}
            name="httpProxy.enable"
            render={({ field: { value, ...other } }) => (
              <AdaptiveSwitch
                {...other}
                checked={value ?? false}
                edge="end"
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
              primary={`↳ ${t('http_proxy_port')}`}
            />
            <ListItemSecondaryAction>
              <TextField
                className={`${styles.textField} ${styles.indentInput}`}
                {
                  ...form.register('httpProxy.port', {
                    min: 1024,
                    max: 65535,
                    validate: (value, record) => {
                      const httpPort = +value;
                      const pacPort = +record.pacPort;
                      const localPort = +record.localPort;
                      const num = localPort ^ pacPort ^ httpPort;
                      return (num !== localPort && num !== pacPort && num !== httpPort);
                    },
                  })
                }
                required
                error={!!errors.httpProxy?.port}
                helperText={!!errors.httpProxy?.port && t('invalid_value')}
                size="small"
                type="number"
                placeholder={t('http_proxy_port')}
              />
            </ListItemSecondaryAction>
          </ListItem>
        }
      />
    </>
  )
}

export default HttpProxy;
