import React, { useMemo } from 'react';
import {
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  TextField,
  Tooltip,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';

import { TextWithTooltip } from '@renderer/components/Pices/TextWithTooltip';
import { Settings } from '@renderer/types';

interface OpenAIAPIKeyProps {
  form: UseFormReturn<Settings>;
}

const OpenAIAPIKey: React.FC<OpenAIAPIKeyProps> = ({ form }) => {
  const { t } = useTranslation();
  const openAIAPIKey = form.watch('openAIAPIKey');

  const keyTips = useMemo(
    () =>
      openAIAPIKey?.split(',').map((key) => (
        <p style={{ wordBreak: 'break-all' }} key={key}>
          {key}
        </p>
      )),
    [openAIAPIKey],
  );

  return (
    <ListItem>
      <ListItemText
        primary={
          <TextWithTooltip
            text={t('open_ai_api_key')}
            tooltip={t('open_ai_api_key_tips')}
          />
        }
      />
      <ListItemSecondaryAction>
        <Tooltip
          arrow
          placement="top"
          hidden={!openAIAPIKey}
          title={openAIAPIKey ? keyTips ?? t('none') : t('none')}>
          <TextField
            {...form.register('openAIAPIKey')}
            required
            fullWidth
            type="text"
            size="small"
            placeholder={t('open_ai_api_key_tips_short')}
          />
        </Tooltip>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default OpenAIAPIKey;
