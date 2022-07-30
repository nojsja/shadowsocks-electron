import React from 'react';
import { Field } from "rc-field-form";
import { useTranslation } from 'react-i18next';
import { FormInstance, Rule } from 'rc-field-form/es/interface';
import {
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  TextField
} from "@material-ui/core";
import Form from 'rc-field-form';

import { AdaptiveSwitch } from "../../components/Pices/Switch";
import { TextWithTooltip } from '../../components/Pices/TextWithTooltip';

import { useStylesOfSettings as useStyles } from "../styles";
import If from '../../components/HOC/IF';

interface HttpProxyProps {
  rules?: Rule[] | undefined;
  form: FormInstance<any>
}

const HttpProxy: React.FC<HttpProxyProps> = ({
  rules,
  form,
}) => {
  const { t } = useTranslation();
  const styles = useStyles();
  const enable = Form.useWatch(['httpProxy', 'enable'], form);

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
          <Field name={["httpProxy", "enable"]} valuePropName="checked">
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
                name={["httpProxy", "port"]}
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
