import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  DialogContent,
  IconButton,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
} from "@material-ui/core";
import { useTranslation } from 'react-i18next';
import BorderColorIcon from '@material-ui/icons/BorderColor';

import { DialogTitle } from '../home/AddServerDialog';
import { AdaptiveDialog } from '../../components/Pices/Dialog';
import StyledTextareaAutosize from '../../components/Pices/TextAreaAutosize';
import { MessageChannel } from 'electron-re';

const pacRuleDemos =
`*
! Demo[01] -------------
! * 标记
! 如：*.example.com/*
! 表示：
! https://www.example.com
! https://image.example.com
! https://image.example.com/abcd
! 等，都会走代理。
!
! Demo[02] -------------
! @@ 标记
! 例外规则，满足@@规则的地址都不会走代理。
! 如：@@*.example.com/*
! 表示：
! https://www.example.com
! https://image.example.com
! https://image.example.com/abcd
! 等，都不会走代理。
!
! Demo[03] -------------
! || 标记
! 只匹配域名的结尾。
! 如：||example.com
! 表示：
! http://example.com/abcd
! https://example.com
! ftp://example.com
! 等，都会走代理。
!
! Demo[04] -------------
! | 标记
! 匹配地址的开头和结尾。
! 如：|https://ab.com
! 表示以 https://ab.com 开头的地址会走代理。
! 如：ab.com|
! 表示以 ab.com 结尾的地址会走代理。
!
! Demo[05] -------------
! ! 标记
! 注释。
! 如：
! !||example.com
! !后面的内容表示注释，以!开头的规则也会无效。





`;

interface EditorProps {
  onPacContentChange: (content: string) => void;
}

const Editor: React.FC<EditorProps> = React.memo(({ onPacContentChange }) => {
  return (
    <StyledTextareaAutosize
      minRows={20}
      defaultValue={pacRuleDemos}
      onTextChange={onPacContentChange}
    />
  );
});

const UserPacEditor: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const { t } = useTranslation();
  const contentRef = useRef<string>(pacRuleDemos);

  const handleClose = () => {
    setVisible(false);
  };

  const handleOpen = () => {
    setVisible(true);
  };

  const onPacContentSubmit = useCallback((rules: string) => {
    MessageChannel.invoke('main', 'service:main', {
      action: 'updateUserPacRules',
      params: { rules }
    });
  }, []);

  const onPacContentChange = (text: string) => {
    contentRef.current = text;
  };

  useEffect(() => {
    return () => {
      onPacContentSubmit(contentRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ListItem>
        <ListItemText
          primary={'PAC'}
          secondary={<span>{t('custom_user_rules')}</span>}
        />
        <ListItemSecondaryAction>
          <IconButton onClick={handleOpen} >
            <BorderColorIcon />
          </IconButton>
          <AdaptiveDialog fullWidth color="primary" onClose={handleClose} open={visible}>
            <DialogTitle onClose={handleClose} attr='share'></DialogTitle>
            <DialogContent>
              <Editor onPacContentChange={onPacContentChange} />
            </DialogContent>
          </AdaptiveDialog>
        </ListItemSecondaryAction>
    </ListItem>
  );
};

export default UserPacEditor;
