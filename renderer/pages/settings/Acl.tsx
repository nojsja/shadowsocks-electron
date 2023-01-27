import React from 'react';
import { useTranslation } from 'react-i18next';
import path from 'path';
import { Controller, UseFormReturn } from 'react-hook-form';
import {
  Button,
  ListItem,
  ListItemSecondaryAction,
  Tooltip,
} from '@material-ui/core';

import { AdaptiveSwitch } from '../../components/Pices/Switch';
import ListItemTextMultipleLine from '../../components/Pices/ListItemTextMultipleLine';
import { TextWithTooltip } from '../../components/Pices/TextWithTooltip';
import { Settings } from '../../types';
import AclEditor from './AclEditor';

import { useStylesOfSettings as useStyles } from '../styles';

interface AclProps {
  form: UseFormReturn<Settings>;
  setAclUrl: () => void;
  touchField: (field: string, status: boolean) => void;
  isFieldTouched: (attr: string) => boolean;
}

const Acl: React.FC<AclProps> = ({
  setAclUrl,
  touchField,
  isFieldTouched,
  form,
}) => {
  const { t } = useTranslation();
  const enable = form.watch('acl.enable');
  const url = form.watch('acl.url') || '';
  const styles = useStyles();

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
              text="ACL"
              tooltip={
                t('readme_acl')
              }
            />
          }
        />
        <ListItemSecondaryAction>
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
      {
        enable && (
          <ListItem className={styles.sub}>
            <ListItemTextMultipleLine
              primary={
                <Controller
                  control={form.control}
                  name="acl.url"
                  render={({ field }) => (
                    url ?
                      (
                        <Tooltip
                          arrow
                          placement="top"
                          title={!!url && url}
                        >
                          <span>└─ {path.basename(field.value || '(none)')}</span>
                        </Tooltip>
                      )
                      : (
                        <span>└─ {path.basename(field.value || '(none)')}</span>
                      )
                  )}
                />
              }
            />
            <ListItemSecondaryAction>
              {enable && (<Button onClick={setAclAction} size="small">{t('select')}</Button>)}
              {url && (<AclEditor url={url} touchField={touchField} isFieldTouched={isFieldTouched} />)}
            </ListItemSecondaryAction>
          </ListItem>
        )
      }
    </>
  )
}

export default Acl;
