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
import { debounce } from '../../utils';
import { enqueueSnackbar as SnackbarAction } from '../../redux/actions/notifications';
import { TextWithTooltip } from '../../components/Pices/TextWithTooltip';
import useLayoutDidUpdate from '../../hooks/useLayoutDidUpdate';

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

// eslint-disable-next-line react/prop-types
const Editor = React.memo<EditorProps>(function Editor({ onPacContentChange, defaultValue }) {
  return (
    <StyledTextareaAutosize
      minRows={20}
      defaultValue={defaultValue}
      onTextChange={onPacContentChange}
    />
  );
});

interface UserPacEditorProps {
  touchField: (attr: string, status: boolean) => void;
  isFieldTouched: (attr: string) => boolean;
}

const UserPacEditor: React.FC<UserPacEditorProps> = ({ touchField, isFieldTouched }) => {
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation();
  const contentRef = useRef<string>(pacRuleDemos);
  const [pacContent, setPacContent] = useState(pacRuleDemos);
  const dispatch = useDispatch();

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
      action: 'updateUserPacRules',
      params: { rules }
    })
      .then(({ code, result }) => {
        if (code === 500) {
          dispatch(SnackbarAction(result, { variant: 'error' }));
        }
      });
  }, .5e3), []);

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
  }, []);

  const onPacContentChange = (text: string) => {
    contentRef.current = text;
    touchField('pac', true);
  };

  useLayoutDidUpdate(() => {
    if (visible) {
      getUserPacContent();
    }
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
