import { KeyboardEvent } from 'react';
import React, {
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from 'react';
import { TextareaAutosizeProps } from '@material-ui/core';
import PropTypes from 'prop-types';

import StyledTextareaAutosize from './TextAreaAutosize';

const KEY_CODE = {
  TAB: 9,
  S: 83,
};

export interface TextEditorRef {
  getValue: () => string;
  setValue: (content: string) => void;
  focus: () => void;
  getCursor: () => [number, number];
  restoreCursor: (selectionStart: number, selectionEnd: number) => void;
}

interface EditorProps extends Omit<TextareaAutosizeProps, 'onChange' | 'value' | 'ref'> {
  onChange?: (content: string) => void;
  onContentSave?: (value: string) => void;
  editorRef?: React.Ref<TextEditorRef>;
  defaultValue: string;
  noAutosize?: boolean;
}

const TextEditor: React.FC<EditorProps> = ({
  onChange,
  onContentSave,
  defaultValue,
  wrap,
  editorRef,
  ...others
}) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  const setValue = (value: string) => {
    if (!ref.current) return;
    if (ref.current.value === value) return;
    ref.current.value = value;
  };

  const onTabKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    if (!ref.current) return;
    const indent = '  ';
    const start = ref.current.selectionStart;
    const end = ref.current.selectionEnd;
    const currentValue = ref.current.value;
    let selected = window.getSelection()?.toString() || '';

    selected = indent + selected.replace(/\n/g, '\n' + indent);
    ref.current.value = currentValue.substring(0, start) + selected + currentValue.substring(end);
    ref.current.setSelectionRange(start + indent.length, start + selected.length);
    onChange?.(ref.current.value);
  };

  const onContentSaveInner = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    onContentSave?.(ref.current?.value || '');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    switch (e.keyCode) {
      case KEY_CODE.TAB:
        onTabKeyDown(e);
        break;
      case KEY_CODE.S:
        if (e.ctrlKey || e.metaKey) {
          onContentSaveInner(e);
        }
        break;
      default:
        break;
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
      onKeyDown={onKeyDown}
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