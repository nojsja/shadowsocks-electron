import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Select,
  MenuItem,
} from '@material-ui/core';
import { Controller, UseFormReturn } from 'react-hook-form';

import { Settings } from '../../types';
import { TextWithTooltip } from '@renderer/components/Pices/TextWithTooltip';

interface TerminalDefaultModeProps {
  form: UseFormReturn<Settings>;
}

const TerminalDefaultMode: React.FC<TerminalDefaultModeProps> = ({ form }) => {
  const { t } = useTranslation();

  return (
    <>
      <ListItem>
        <ListItemText
          primary={
            <TextWithTooltip
              text={t('terminal_mode')}
              tooltip={t('terminal_mode_tips')}
            />
          }
        />
        <ListItemSecondaryAction>
          <Controller
            control={form.control}
            name="terminalDefaultMode"
            render={({ field }) => (
              <Select {...field} defaultValue="normal">
                <MenuItem value="ai">{t('ai_mode')}</MenuItem>
                <MenuItem value="normal">{t('normal_mode')}</MenuItem>
              </Select>
            )}
          />
        </ListItemSecondaryAction>
      </ListItem>
    </>
  );
};

export default TerminalDefaultMode;
