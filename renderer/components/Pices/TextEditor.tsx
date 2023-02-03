import React, {
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from 'react';
import { TextareaAutosizeProps } from '@material-ui/core';
import PropTypes from 'prop-types';

import StyledTextareaAutosize from './TextAreaAutosize';

export interface TextEditorRef {
  getValue: () => string;
  setValue: (content: string) => void;
  focus: () => void;
  getCursor: () => [number, number];
  restoreCursor: (selectionStart: number, selectionEnd: number) => void;
}

interface EditorProps extends Omit<TextareaAutosizeProps, 'onChange' | 'value' | 'ref'> {
  onChange: (content: string) => void;
  editorRef?: React.Ref<TextEditorRef>;
  defaultValue: string;
  noAutosize?: boolean;
}

const TextEditor: React.FC<EditorProps> = ({
  onChange,
  defaultValue,
  wrap,
  editorRef,
  ...others
}) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  const setValue = (value: string) => {
    if (ref.current) {
      ref.current.value = value;
    }
  };

  useLayoutEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  useImperativeHandle(editorRef, () => ({
    getValue: () => ref.current?.value || '',
    setValue,
    focus: () => ref.current?.focus(),
    getCursor: () => {
      if (ref.current) {
        return [ref.current.selectionStart, ref.current.selectionEnd];
      }
      return [0, 0];
    },
    restoreCursor: (selectionStart: number, selectionEnd: number) => {
      if (ref.current) {
        ref.current.setSelectionRange(selectionStart, selectionEnd);
      }
    }
  }), []);

  return (
    <StyledTextareaAutosize
      {...others}
      minRows={20}
      defaultValue={defaultValue}
      onTextChange={onChange}
      wrap={wrap}
      ref={ref}
    />
  );
};

TextEditor.displayName = 'TextEditor';
TextEditor.propTypes = {
  onChange: PropTypes.func.isRequired,
  defaultValue: PropTypes.string.isRequired,
  editorRef: PropTypes.any,
  wrap: PropTypes.string,
  noAutosize: PropTypes.bool,
};

export default React.memo(TextEditor);