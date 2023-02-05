import React, { useCallback, useRef, useState } from 'react';
import Cron, { CronError } from 'react-js-cron-mui';
import {
  TextField,
  TextFieldProps,
  DialogTitleProps,
  Typography,
  IconButton,
  DialogContent,
  Switch,
  Tooltip,
} from '@material-ui/core';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import CloseIcon from '@material-ui/icons/Close';
import { TimerTwoTone as TimerIcon } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';

import { AdaptiveDialog } from '@renderer/components/Pices/Dialog';
import GradientDivider from '@/renderer/components/Pices/GradientDivider';

type onCloseType = () => void;

interface Props {
  renderButton?: () => React.ReactNode;
}

interface DefineDialogTitleProps extends DialogTitleProps {
  onClose: onCloseType
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      margin: 0,
      padding: theme.spacing(2),
    },
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
    dialogContent: {},
    divider: {
      marginBottom: theme.spacing(1),
    }
  }));

export const DialogTitle = (props: DefineDialogTitleProps) => {
  const classes = useStyles();
  const { children, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
};

const WorkflowScheduleDialog: React.FC<Props> = (props) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const styles = useStyles();
  const inputRef = useRef<TextFieldProps>()
  const defaultValue = '* * * * *'
  const [value, setValue] = useState(defaultValue)
  const [textValue, setTextValue] = useState('');
  const customSetValue = useCallback(
    (newValue: string) => {
      setValue(newValue)
      setTextValue(newValue);
    },
    [setTextValue]
  )
  const [, onError] = useState<CronError>()

  return (
    <>
      <IconButton size="small" onClick={() => setOpen(true)}>
        { props.renderButton?.() || <TimerIcon /> }
      </IconButton>
      <AdaptiveDialog onClose={() => setOpen(false)} open={open}>
        <DialogTitle onClose={() => setOpen(false)}>{t('set_timed_execution_rule')}</DialogTitle>
        <DialogContent className={styles.dialogContent}>
          <TextField
            value={`${textValue}  [crontab syntax]`}
            inputRef={inputRef}
            disabled
            onBlur={(event) => {
              setValue(event.target.value)
            }}
            onChange={(event: any) => {
              customSetValue(event.target.value)
            }}
          />
          <Tooltip title="disabled">
            <IconButton size="small">
                <Switch color="primary" />
            </IconButton>
          </Tooltip>
          <div className={styles.divider}>
            <GradientDivider />
          </div>
          <Cron value={value} setValue={customSetValue} onError={onError} />
        </DialogContent>
      </AdaptiveDialog>
    </>
  );
};

export default WorkflowScheduleDialog;
