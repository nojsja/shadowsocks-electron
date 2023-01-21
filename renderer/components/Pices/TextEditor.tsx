import React, { useLayoutEffect, useRef } from 'react';
import { TextareaAutosizeProps } from '@material-ui/core';

import StyledTextareaAutosize from './TextAreaAutosize';

interface EditorProps extends Omit<TextareaAutosizeProps, 'onChange' | 'value'> {
  onChange: (content: string) => void;
  defaultValue: string;
}

const TextEditor: React.FC<EditorProps> = ({ onChange, defaultValue }) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    if (ref.current) {
      ref.current.value = defaultValue;
    }
  }, [defaultValue]);

  return (
    <StyledTextareaAutosize
      minRows={20}
      defaultValue={defaultValue}
      ref={ref}
      onTextChange={onChange}
    />
  );
};

export default React.memo(TextEditor);