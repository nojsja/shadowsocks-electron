import React from "react";
import {
  TextareaAutosize,
  TextareaAutosizeProps
} from "@material-ui/core";
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import { grey } from '@material-ui/core/colors';
import classNames from 'classnames';
import { scrollBarStyle } from '@/renderer/pages/styles';

export interface TextAreaProps extends TextareaAutosizeProps {
  onTextChange?: (text: string, e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  noAutosize?: boolean;
}

const useStyles = makeStyles((theme: Theme) => createStyles({
  textarea: {
    width: '100%',
    border: `solid 1px ${theme.palette.type === 'dark' ? grey[700] : 'lightgrey'}`,
    outline: 'none',
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.type === 'dark' ? grey[400] : grey[900],
    overflowX: 'hidden',
    ...scrollBarStyle(6, 0, theme),
  },
  nowrap: {
    whiteSpace: 'nowrap',
  },
  noAutosize: {
    height: 'unset !important',
  }
}));

const StyledTextareaAutosize = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(function StyledTextareaAutosize(props: TextAreaProps, ref) {
  const { onTextChange, wrap, noAutosize, ...other } = props;

  const onInnerChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onTextChange?.(event.target.value, event);
  }

  const TextArea = (props: TextAreaProps) => {
    const classes = useStyles();

    return (
      <TextareaAutosize
        {...props}
        ref={ref}
        className={classNames(
          classes.textarea,
          wrap === 'off' && classes.nowrap, props.className,
          noAutosize && classes.noAutosize,
        )}
        onChange={onInnerChange}
      />
    )
  };

  return <TextArea {...other}/>;
});

export default StyledTextareaAutosize;
