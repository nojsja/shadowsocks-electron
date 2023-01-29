import React, {
  useEffect,
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
  ref?: React.Ref<TextEditorRef>;
  defaultValue: string;
  noAutosize?: boolean;
}

const TextEditor: React.FC<EditorProps> = React.forwardRef(({
  onChange,
  defaultValue,
  ref: r,
  wrap,
  ...others
}, refObject) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  const setValue = (value: string) => {
    if (ref.current) {
      ref.current.value = value;
    }
  };

  useLayoutEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  useImperativeHandle(refObject, () => ({
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
      minRows={20}
      defaultValue={defaultValue}
      ref={ref}
      onTextChange={onChange}
      wrap={wrap}
      {...others}
    />
  );
});

TextEditor.displayName = 'TextEditor';
TextEditor.propTypes = {
  onChange: PropTypes.func.isRequired,
  defaultValue: PropTypes.string.isRequired,
  ref: PropTypes.any,
  wrap: PropTypes.string,
  noAutosize: PropTypes.bool,
};

export default React.memo(TextEditor);