import React, { useCallback, useRef, useState } from 'react';
import {
  DialogContent,
  IconButton,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
} from "@material-ui/core";
import { useTranslation } from 'react-i18next';
import BorderColorIcon from '@material-ui/icons/BorderColor';
import { MessageChannel } from 'electron-re';

import { Message } from '@renderer/hooks/useNotifier';
import { DialogTitle } from '@renderer/pages/home/AddServerDialog';
import { AdaptiveDialog } from '@renderer/components/Pices/Dialog';
import { TextWithTooltip } from '@renderer/components/Pices/TextWithTooltip';
import TextEditor from '@renderer/components/Pices/TextEditor';

import { debounce } from '@renderer/utils';
import useDidUpdate from '@renderer/hooks/useDidUpdate';

const pacRuleDemos =
`
! Demo[01] -------------
! *.example.com/*
! > Links will go through proxy:
! >> https://www.example.com
! >> https://image.example.com
! >> https://image.example.com/abcd
!
! Demo[02] -------------
! @@*.example.com/*
! > Links will NOT go through proxy:
! >> https://www.example.com
! >> https://image.example.com
! >> https://image.example.com/abcd
!
! Demo[03] -------------
! ||example.com
! > Links will go through proxy:
! >> http://example.com/abcd
! >> https://example.com
! >> ftp://example.com
!
! Demo[04] -------------
! |https://ab.jp
! > Links will go through proxy:
! >> https://ab.jp.cn
! >> https://ab.jp.com
!
! ab.com|
! > Links will go through proxy:
! >> https://c.ab.com
! >> https://d.ab.com
! >> ftp://d.ab.com
!
! Demo[05] -------------
! The line starts with ! is comment.


`;

interface GlobalPacEditorProps {
  touchField: (attr: string, status: boolean) => void;
  isFieldTouched: (attr: string) => boolean;
}

const GlobalPacEditor: React.FC<GlobalPacEditorProps> = ({ touchField, isFieldTouched }) => {
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation();
  const contentRef = useRef<string>(pacRuleDemos);
  const [pacContent, setPacContent] = useState(pacRuleDemos);

  const handleClose = () => {
    if (isFieldTouched('pac')) {
      onPacContentSubmit(contentRef.current);
      touchField('pac', false);
    }
    setVisible(false);
  };

  const handleOpen = () => {
    setVisible(true);
  };

  const onPacContentSubmit = useCallback(debounce((rules: string) => {
    MessageChannel.invoke('main', 'service:main', {
      action: 'updateGlobalPacRules',
      params: { rules }
    })
      .then(({ code, result }) => {
        if (code === 500) {
          Message.error(result);
        }
      });
  }, .5e3), []);

  const getUserPacContent = useCallback(() => {
    MessageChannel.invoke('main', 'service:main', {
      action: 'getGlobalPacRules',
      params: {}
    })
      .then(({ code, result }) => {
        if (code === 200) {
          if (result) {
            contentRef.current = result;
            setPacContent(result);
          }
        } else {
          Message.error(result);
        }
      });
  }, []);

  const onPacContentChange = (text: string) => {
    contentRef.current = text;
    touchField('pac', true);
  };

  useDidUpdate(() => {
    if (visible) {
      getUserPacContent();
    }
  }, [visible]);

  return (
    <ListItem>
      <ListItemText
        primary={
          <TextWithTooltip
            text={`PAC (${t('global').toLowerCase()})`}
            tooltip={
              t('customize_global_pac_tips')
            }
          />
        }
        secondary={t('customize_global_rules')}
      />
      <ListItemSecondaryAction>
        <IconButton onClick={handleOpen} >
          <BorderColorIcon />
        </IconButton>
        <AdaptiveDialog fullWidth color="primary" onClose={handleClose} open={visible}>
          <DialogTitle onClose={handleClose} attr='share'></DialogTitle>
          <DialogContent>
            <TextEditor onChange={onPacContentChange} defaultValue={pacContent} />
          </DialogContent>
        </AdaptiveDialog>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default GlobalPacEditor;
