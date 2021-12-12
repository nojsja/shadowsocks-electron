import React from "react";
import {
  TextareaAutosize,
  TextareaAutosizeProps
} from "@material-ui/core";
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import { grey } from "@material-ui/core/colors";
import { Settings } from "../../types";

export interface TextAreaProps extends TextareaAutosizeProps {
  onTextChange?: (attr: keyof Settings, event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const StyledTextareaAutosize = React.memo((props: TextAreaProps) => {
  const useStyles = makeStyles((theme: Theme) => createStyles({
    textarea: {
      width: '100%',
      border: `solid 1px ${theme.palette.type === 'dark' ? grey[700] : 'lightgrey'}`,
      outline: 'none',
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.type === 'dark' ? grey[500] : grey[900],
    }
  }));

  const onInnerChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (props.onTextChange) {
      return props.onTextChange("acl", event);
    }
  }

  const TextArea = (props: TextAreaProps) => {
    const { onTextChange, ...rest } = props;
    const classes = useStyles();

    return <TextareaAutosize {...rest} className={classes.textarea} onChange={onInnerChange}/>
  };

  return <TextArea {...props}/>;
});

export default StyledTextareaAutosize;
