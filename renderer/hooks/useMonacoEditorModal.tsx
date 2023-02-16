import React, { useContext, useRef, useState } from 'react';
import MonacoEditor, { MonacoEditorProps } from 'react-monaco-editor';
import { createStyles, Dialog, Theme, withStyles } from '@material-ui/core';

import { scrollBarStyle } from '@renderer/pages/styles';

const StyledDialog = withStyles((theme: Theme) => (
  createStyles({
    root: {
      '& *': scrollBarStyle(6, 0, theme)
    }
  })
))(Dialog);

interface EditorProps {
  setValue: (value: string) => void;
  openModal: () => void;
  closeModal: () => void;
}

export const MonacoEditorModalContext = React.createContext<EditorProps> ({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setValue: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  openModal: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  closeModal: () => {},
});

export const MonacoEditorModalContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [editorProps, setEditorProps] = useState<MonacoEditorProps>({});
  const editorRef = useRef<any>(null);
  const [open, setOpen] = useState(false);

  const onClose = () => {
    setOpen(false);
  };

  const onOpen = (editorProps: MonacoEditorProps = {}) => {
    setOpen(true);
    setEditorProps(editorProps);
  };

  const setValue = (value: string) => {
    if (!editorRef.current) return;
    editorRef.current.editor.setValue(value);
  };

  const onEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const onEditorValueChange = (value: string) => {
    console.log(value);
  };

  return (
    <MonacoEditorModalContext.Provider
      value={{
        setValue,
        openModal: onOpen,
        closeModal: onClose,
      }}
    >
      {children}
      <StyledDialog
        open={open}
        onClose={onClose}
      >
        <MonacoEditor
          width="800"
          height="600"
          language="javascript"
          theme="vs-dark"
          options={{
            selectOnLineNumbers: true,
          }}
          {...editorProps}
          value=""
          onChange={onEditorValueChange}
          editorDidMount={onEditorDidMount}
        />
      </StyledDialog>
    </MonacoEditorModalContext.Provider>
  );
};

export const useMonacoEditorModal = (): EditorProps => {
  const { setValue, openModal, closeModal } = useContext<EditorProps>(MonacoEditorModalContext);

  return {
    openModal,
    closeModal,
    setValue,
  };
};

export default useMonacoEditorModal;