import React from 'react';
import { Field } from "rc-field-form";
import { useTranslation } from 'react-i18next';
import { Rule } from 'rc-field-form/es/interface';
import path from 'path';
import {
  ListItem,
  ListItemSecondaryAction,
  Tooltip,
  Button
} from "@material-ui/core";

import { AdaptiveSwitch } from "../../components/Pices/Switch";
import ListItemTextMultipleLine from "../../components/Pices/ListItemTextMultipleLine";
import If from "../../components/HOC/IF";
import { TextWithTooltip } from '../../components/Pices/TextWithTooltip';
import { ACL } from '../../types';

interface AclProps {
  rules?: Rule[] | undefined;
  setAclUrl: () => void;
  touchField: (field: string, status: boolean) => void;
  acl: ACL;
}

const Acl: React.FC<AclProps> = ({
  setAclUrl,
  acl,
  touchField,
}) => {
  const { t } = useTranslation();
  const enable = !!acl?.enable;
  const url = acl?.url || '';

  const setAclAction = () => {
    touchField('acl', true);
    setAclUrl();
  };

  return (
    <>
      <ListItem>
        <ListItemTextMultipleLine
          primary={
            <TextWithTooltip
              text={'ACL'}
              tooltip={
                t('readme_acl')
              }
            />
          }
          secondary={
            <If
              condition={enable}
              then={
                <Tooltip arrow
                  placement="top"
                  title={
                    <If
                      condition={!!url}
                      then={url}
                    />
                  }
                >
                  <Field name={["acl", "url"]}>
                    <span>{path.basename(url || '')}</span>
                  </Field>
                </Tooltip>
              }
            />
          }
        />
        <ListItemSecondaryAction>
          <If
            condition={enable}
            then={<Button onClick={setAclAction} size="small">{t('select')}</Button>}
          />
          <Field name={["acl", "enable"]} valuePropName="checked">
            <AdaptiveSwitch
              edge="end"
            />
          </Field>
          <input style={{ display: 'none' }} type="file"></input>
        </ListItemSecondaryAction>
      </ListItem>
    </>
  )
}

export default Acl;
