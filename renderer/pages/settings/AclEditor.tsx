import React, {
  useCallback,
  useRef, useState,
} from 'react';
import {
  DialogContent,
} from "@material-ui/core";
import BorderColorIcon from '@material-ui/icons/BorderColor';
import { MessageChannel } from 'electron-re';
import { useDispatch } from 'react-redux';

import { DialogTitle } from '../home/AddServerDialog';
import { AdaptiveDialog } from '../../components/Pices/Dialog';
import IconButtonSmaller from '../../components/Pices/IconButtonSmaller';
import TextEditor from '../../components/Pices/TextEditor';

import { enqueueSnackbar as SnackbarAction } from '../../redux/actions/notifications';
import { debounce } from '../../utils';

interface AclEditorProps {
  touchField: (attr: string, status: boolean) => void;
  isFieldTouched: (attr: string) => boolean;
  url: string;
}

const AclEditor: React.FC<AclEditorProps> = ({ touchField, isFieldTouched, url }) => {
  const [visible, setVisible] = useState(false);
  const contentRef = useRef<string>('');
  const [aclContent, setAclContent] = useState('');
  const dispatch = useDispatch();

  const onAclContentSubmit = useCallback(debounce((rules: string, url: string) => {
    MessageChannel.invoke('main', 'service:main', {
      action: 'updateLocalFileContent',
      params: {
        path: url,
        content: rules,
      }
    })
    .then(({ code, result }) => {
      if (code === 500) {
        dispatch(SnackbarAction(<span style={{ wordBreak: 'break-word' }}>{result}</span>, { variant: 'error', autoHideDuration: 4e3 }));
      }
    });
  }, .5e3), []);

  const getAclContent = useCallback((url: string) => {
    MessageChannel.invoke('main', 'service:main', {
      action: 'getLocalFileContent',
      params: {
        path: url,
      }
    })
    .then(({ code, result }) => {
      if (code === 200) {
        if (result) {
          contentRef.current = result;
          setAclContent(result);
        }
      } else {
        dispatch(SnackbarAction(<span style={{ wordBreak: 'break-word' }}>{result}</span>, { variant: 'error', autoHideDuration: 4e3 }));
      }
    });
  }, []);

  const onAclContentChange = (text: string) => {
    contentRef.current = text;
    touchField('aclRules', true);
  };

  const handleClose = () => {
    if (isFieldTouched('aclRules')) {
      onAclContentSubmit(contentRef.current, url);
    }
    setVisible(false);
  };

  const handleOpen = () => {
    getAclContent(url);
    setVisible(true);
  };

  return (
    <>
      <IconButtonSmaller onClick={handleOpen} >
        <BorderColorIcon fontSize="small" />
      </IconButtonSmaller>
      <AdaptiveDialog fullWidth color="primary" onClose={handleClose} open={visible}>
        <DialogTitle onClose={handleClose} attr='share'></DialogTitle>
        <DialogContent>
          <TextEditor onChange={onAclContentChange} defaultValue={aclContent} />
        </DialogContent>
      </AdaptiveDialog>
    </>
  );
};

export default AclEditor;
