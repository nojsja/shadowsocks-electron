import React, { useCallback } from 'react';
import { TextField } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Tooltip } from '@material-ui/core';
import { RestorePage, NoteAdd } from '@material-ui/icons';

import { useStyles } from './style';

import { TextWithTooltip } from '../../components/Pices/TextWithTooltip';
import { UseFormReturn } from 'react-hook-form';
import { Settings } from '../../types';

interface GfwListUrlProps {
  reGeneratePacFile: (params: { url?: string; text?: string }) => void;
  gfwListUrl: string;
  form: UseFormReturn<Settings>;
}

const GfwListUrl: React.FC<GfwListUrlProps> = ({
  reGeneratePacFile,
  gfwListUrl,
  form,
}) => {
  const { t } = useTranslation();
  const styles = useStyles();
  const inputFileRef = React.useRef<HTMLInputElement>(null);

  const reGeneratePacFileWithFile = () => {
    inputFileRef.current?.click();
  };

  const reGeneratePacFileWithUrl = () => {
    reGeneratePacFile({
      url: gfwListUrl,
    });
  };

  const onGFWListFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          const text = e.target.result;
          if (text) {
            reGeneratePacFile({
              text: text,
            });
          }
        };
        reader.readAsText(file);
      }
    },
    [reGeneratePacFile],
  );

  return (
    <>
      <TextField
        className={styles.textField}
        {...form.register('gfwListUrl')}
        required
        fullWidth
        type="url"
        size="small"
        label={
          <TextWithTooltip
            text={t('gfwlist_url')}
            icon={
              <span>
                <Tooltip
                  arrow
                  placement="top"
                  title={t<string>('recover_pac_file_with_link')}>
                  <RestorePage
                    className={`${styles.cursorPointer} ${styles.colorGrey}`}
                    onClick={reGeneratePacFileWithUrl}
                  />
                </Tooltip>
                <Tooltip
                  arrow
                  placement="top"
                  title={t<string>('recover_pac_file_with_file')}>
                  <NoteAdd
                    className={`${styles.cursorPointer} ${styles.colorGrey}`}
                    onClick={reGeneratePacFileWithFile}
                  />
                </Tooltip>
              </span>
            }
          />
        }
        placeholder={t('gfwlist_url_tips')}
      />
      <input
        onChange={onGFWListFileChange}
        ref={inputFileRef}
        type={'file'}
        multiple={false}
        style={{ display: 'none' }}></input>
    </>
  );
};

export default GfwListUrl;
