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
import { useDispatch } from 'react-redux';

import { DialogTitle } from '../home/AddServerDialog';
import { AdaptiveDialog } from '../../components/Pices/Dialog';
import StyledTextareaAutosize from '../../components/Pices/TextAreaAutosize';
import useDidUpdate from '../../hooks/useDidUpdate';
import { debounce } from '../../utils';
import { enqueueSnackbar as SnackbarAction } from '../../redux/actions/notifications';
import { TextWithTooltip } from '../../components/Pices/TextWithTooltip';

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

interface EditorProps {
  onPacContentChange: (content: string) => void;
  defaultValue: string;
}

const Editor: React.FC<EditorProps> = React.memo(({ onPacContentChange, defaultValue }) => {
  return (
    <StyledTextareaAutosize
      minRows={20}
      defaultValue={defaultValue}
      onTextChange={onPacContentChange}
    />
  );
});

interface UserPacEditorProps {
  touchField: (attr: string) => void;
}

const UserPacEditor: React.FC<UserPacEditorProps> = ({ touchField }) => {
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation();
  const contentRef = useRef<string>(pacRuleDemos);
  const [pacContent, setPacContent] = useState(pacRuleDemos);
  const dispatch = useDispatch();

  const handleClose = () => {
    setVisible(false);
  };

  const handleOpen = () => {
    setVisible(true);
  };

  const onPacContentSubmit = useCallback(debounce((rules: string) => {
    MessageChannel.invoke('main', 'service:main', {
      action: 'updateUserPacRules',
      params: { rules }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, 1e3), []);

  const getUserPacContent = useCallback(() => {
    MessageChannel.invoke('main', 'service:main', {
      action: 'getUserPacRules',
      params: {}
    })
    .then(({ code, result }) => {
      if (code === 200) {
        if (result) {
          contentRef.current = result;
          setPacContent(result);
        }
      } else {
        dispatch(SnackbarAction(result, { variant: 'error' }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPacContentChange = (text: string) => {
    contentRef.current = text;
    touchField('pac');
  };

  useDidUpdate(() => {
    if (!visible) {
      onPacContentSubmit(contentRef.current);
    } else {
      getUserPacContent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <ListItem>
        <ListItemText
          primary={
            <TextWithTooltip
              text={'PAC'}
              tooltip={
                t('restart_pac_tips')
              }
            />
          }
          secondary={t('custom_user_rules')}
        />
        <ListItemSecondaryAction>
          <IconButton onClick={handleOpen} >
            <BorderColorIcon />
          </IconButton>
          <AdaptiveDialog fullWidth color="primary" onClose={handleClose} open={visible}>
            <DialogTitle onClose={handleClose} attr='share'></DialogTitle>
            <DialogContent>
            <Editor onPacContentChange={onPacContentChange} defaultValue={pacContent} />
            </DialogContent>
          </AdaptiveDialog>
        </ListItemSecondaryAction>
    </ListItem>
  );
};

export default UserPacEditor;
