import React, { useContext, useEffect, useRef, useState } from 'react';
import MonacoEditor, { MonacoEditorProps } from 'react-monaco-editor';
import {
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  makeStyles,
  Theme,
  useTheme,
  withStyles,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';

import { scrollBarStyle } from '@renderer/pages/style';

const StyledDialog = withStyles((theme: Theme) =>
  createStyles({
    root: {
      '& *': scrollBarStyle(6, 0, theme),
    },
  }),
)(Dialog);

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    content: {
      backgroundColor:
        theme.palette.type === 'dark'
          ? 'rgba(255,255,255, .1)'
          : 'rgba(255, 255, 255, 1)',
    },
    footer: {
      backgroundColor:
        theme.palette.type === 'dark'
          ? 'rgba(255,255,255, .1)'
          : 'rgba(255, 255, 255, 1)',
    },
  }),
);

interface OpenEditorOptions {
  editorProps?: MonacoEditorProps;
  onConfirm?: (value: string) => void;
  onCancel?: () => void;
}

interface EditorProps {
  setValue: (value: string) => void;
  openModal: (options?: OpenEditorOptions) => void;
  closeModal: () => void;
}

export const MonacoEditorModalContext = React.createContext<EditorProps>({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setValue: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  openModal: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  closeModal: () => {},
});

export const MonacoEditorModalContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const styles = useStyles();
  const [editorProps, setEditorProps] = useState<MonacoEditorProps>({});
  const theme = useTheme();
  const editorRef = useRef<any>(null);
  const onConfirmRef = useRef<(value: string) => void>();
  const onCancelRef = useRef<() => void>();
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  const editorTheme = theme.palette.type === 'dark' ? 'vs-dark' : 'vs-light';

  const getCurrentTextEditor = () =>
    editorRef.current?.editor?.getEditors?.()[0];

  const onClose = () => {
    setOpen(false);
    onCancelRef.current?.();
  };

  const onOpen = (options?: OpenEditorOptions) => {
    setOpen(true);
    onConfirmRef.current = options?.onConfirm;
    onCancelRef.current = options?.onCancel;
    options?.editorProps && setEditorProps(options.editorProps);
  };

  const onConfirm = () => {
    onConfirmRef.current?.(getCurrentTextEditor()?.getValue() ?? '');
    setOpen(false);
  };

  const setValue = (value: string) => {
    getCurrentTextEditor()?.setValue(value);
  };

  const onEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = monaco;
  };

  useEffect(() => {
    const resize = () => {
      getCurrentTextEditor()?.layout();
    };
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <MonacoEditorModalContext.Provider
      value={{
        setValue,
        openModal: onOpen,
        closeModal: onClose,
      }}>
      {children}
      <StyledDialog open={open} keepMounted fullWidth maxWidth="lg">
        <DialogContent className={styles.content}>
          <MonacoEditor
            height="70vh"
            language="javascript"
            theme={editorTheme}
            options={{
              selectOnLineNumbers: true,
              minimap: {
                enabled: false,
              },
              tabSize: 2,
              tabCompletion: 'on',
            }}
            {...editorProps}
            value=""
            editorDidMount={onEditorDidMount}
          />
        </DialogContent>
        <DialogActions className={styles.footer}>
          <Button onClick={onConfirm} color="primary">
            {t('ok')}
          </Button>
          <Button onClick={onClose} autoFocus>
            {t('cancel')}
          </Button>
        </DialogActions>
      </StyledDialog>
    </MonacoEditorModalContext.Provider>
  );
};

export const useMonacoEditorModal = (): EditorProps => {
  const { setValue, openModal, closeModal } = useContext<EditorProps>(
    MonacoEditorModalContext,
  );

  return {
    openModal,
    closeModal,
    setValue,
  };
};

export default useMonacoEditorModal;
