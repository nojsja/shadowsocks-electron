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
import ListItemTextMultibleLine from "../../components/Pices/ListItemTextMultibleLine";
import If from "../../components/HOC/IF";

interface AclProps {
  rules?: Rule[] | undefined;
  enable: boolean,
  url: string | undefined,
  setAclUrl: () => void
}

const Acl: React.FC<AclProps> = ({
  setAclUrl,
  enable,
  url
}) => {
  const { t } = useTranslation();

  return (
    <>
      <ListItem>
        <ListItemTextMultibleLine
          primary={'ACL'}
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
                  <span>{path.basename(url || '')}</span>
                </Tooltip>
              }
            />
          }
        />
        <ListItemSecondaryAction>
          <If
            condition={enable}
            then={<Button onClick={setAclUrl} size="small">{t('select')}</Button>}
          />
          <Field name="acl" valuePropName="checked">
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
