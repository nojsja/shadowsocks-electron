import React from "react";
import {
  TextareaAutosize,
  TextareaAutosizeProps
} from "@material-ui/core";
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import { grey } from "@material-ui/core/colors";

export interface TextAreaProps extends TextareaAutosizeProps {
  onTextChange?: (text: string) => void;
}

const StyledTextareaAutosize = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(function StyledTextareaAutosize(props: TextAreaProps, ref) {
  const { onTextChange, ...other } = props;
  const useStyles = makeStyles((theme: Theme) => createStyles({
    textarea: {
      width: '100%',
      border: `solid 1px ${theme.palette.type === 'dark' ? grey[700] : 'lightgrey'}`,
      outline: 'none',
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.type === 'dark' ? grey[400] : grey[900],
    }
  }));

  const onInnerChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onTextChange?.(event.target.value)
  }

  const TextArea = (props: TextAreaProps) => {
    const classes = useStyles();

    return (
      <TextareaAutosize
        {...props}
        ref={ref}
        className={classes.textarea}
        onChange={onInnerChange}
      />
    )
  };

  return <TextArea {...other}/>;
});

export default StyledTextareaAutosize;
