import React, { useCallback } from 'react';
import { Field } from "rc-field-form";
import { TextField } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { Rule } from 'rc-field-form/es/interface';
import { Tooltip } from "@material-ui/core";
import { RestorePage, NoteAdd } from '@material-ui/icons';

import { useStylesOfSettings as useStyles } from "../styles";

import { TextWithTooltip } from "../../components/Pices/TextWithTooltip";


interface GfwListUrlProps {
  rules?: Rule[] | undefined;
  reGeneratePacFile: (params: { url?: string, text?: string }) => void;
  gfwListUrl: string;
}

const GfwListUrl: React.FC<GfwListUrlProps> = ({
  reGeneratePacFile,
  gfwListUrl
}) => {
  const { t } = useTranslation();
  const styles = useStyles();
  const inputFileRef = React.useRef<HTMLInputElement>(null);

  const reGeneratePacFileWithFile = () => {
    inputFileRef.current?.click();
  }

  const reGeneratePacFileWithUrl = () => {
    reGeneratePacFile({
      url: gfwListUrl
    });
  }

  const onGFWListFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const text = e.target.result;
        if (text) {
          reGeneratePacFile({
            text: text
          });
        }
      };
      reader.readAsText(file);
    }
  }, [reGeneratePacFile])

  return (
    <>
      <Field
        name="gfwListUrl"
        validateTrigger={false}
      >
        <TextField
          className={styles.textField}
          required
          fullWidth
          type="url"
          size="small"
          label={
            <TextWithTooltip
              text={t('gfwlist_url')}
              icon={
                <span>
                  <Tooltip arrow placement="top" title={t<string>('recover_pac_file_with_link')}>
                    <RestorePage className={styles.cursorPointer} onClick={reGeneratePacFileWithUrl} />
                  </Tooltip>
                  <Tooltip arrow placement="top" title={t<string>('recover_pac_file_with_file')}>
                    <NoteAdd className={styles.cursorPointer} onClick={reGeneratePacFileWithFile} />
                  </Tooltip>
                </span>
              }
            />
          }
          placeholder={t('gfwlist_url_tips')}
        />
      </Field>
      <input onChange={onGFWListFileChange} ref={inputFileRef} type={'file'} multiple={false} style={{ display: 'none' }}></input>
    </>
  )
}

export default GfwListUrl;
