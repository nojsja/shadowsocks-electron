import React from 'react';
import { useTranslation } from 'react-i18next';
import path from 'path';
import {
  ListItem,
  ListItemSecondaryAction,
  Tooltip,
  Button
} from '@material-ui/core';

import { AdaptiveSwitch } from '../../components/Pices/Switch';
import ListItemTextMultipleLine from '../../components/Pices/ListItemTextMultipleLine';
import { TextWithTooltip } from '../../components/Pices/TextWithTooltip';
import { Settings } from '../../types';
import { Controller, UseFormReturn } from 'react-hook-form';

interface AclProps {
  setAclUrl: () => void;
  touchField: (field: string, status: boolean) => void;
  form: UseFormReturn<Settings>;
}

const Acl: React.FC<AclProps> = ({
  setAclUrl,
  touchField,
  form,
}) => {
  const { t } = useTranslation();
  const enable = form.watch('acl.enable');
  const url = form.watch('acl.url') || '';

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
            enable && (
              <Controller
                control={form.control}
                name="acl.url"
                render={({ field }) => (
                  <Tooltip
                    arrow
                    placement="top"
                    title={!!url && url}
                  >
                    <span>{path.basename(field.value || '')}</span>
                  </Tooltip>
                )}
              />
            )
          }
        />
        <ListItemSecondaryAction>
          { enable && (<Button onClick={setAclAction} size="small">{t('select')}</Button>) }
          <Controller
            control={form.control}
            name="acl.enable"
            render={({ field: { value, ...other } }) => (
              <AdaptiveSwitch
                edge="end"
                {...other}
                checked={value ?? false}
              />)
            }
          />
          <input style={{ display: 'none' }} type="file"></input>
        </ListItemSecondaryAction>
      </ListItem>
    </>
  )
}

export default Acl;
