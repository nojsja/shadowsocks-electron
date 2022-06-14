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
import { TextWithTooltip } from '../../components/Pices/TextWithTooltip';

import { useStylesOfSettings as useStyles } from "../styles";

interface HttpProxyProps {
  rules?: Rule[] | undefined;
  enable: boolean
}

const HttpProxy: React.FC<HttpProxyProps> = ({
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
              text={t('http_proxy')}
              tooltip={
                t('restart_when_changed')
              }
            />
          }
        />
        <ListItemSecondaryAction>
          <Field name="httpProxy" valuePropName="checked">
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
              primary={`↳ ${t('http_proxy_port')}`}
            />
            <ListItemSecondaryAction>
              <Field
                name="httpProxyPort"
                rules={rules}
                normalize={(value: string) => +(value.trim())}
                validateTrigger={false}
              >
                <TextField
                  className={`${styles.textField} ${styles.indentInput}`}
                  required
                  size="small"
                  type="number"
                  placeholder={t('http_proxy_port')}
                />
              </Field>
            </ListItemSecondaryAction>
          </ListItem>
        }
      />
    </>
  )
}

export default HttpProxy;
