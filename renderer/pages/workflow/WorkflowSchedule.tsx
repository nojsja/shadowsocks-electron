import React, { useEffect, useRef, useState } from 'react';
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
  Button,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@material-ui/core';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import CloseIcon from '@material-ui/icons/Close';
import { Save as SaveIcon, TimerTwoTone as TimerIcon } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';

import { AdaptiveDialog } from '@renderer/components/Pices/Dialog';
import { WorkflowRunner, WorkflowTaskTimer } from '@/renderer/types';
import { Response } from '@/renderer/hooks/useRequest';

type onCloseType = () => void;

interface Props {
  renderButton?: () => React.ReactNode;
  editTimerOfRunner: (...args: any[]) => Promise<Response<string | null>>;
  updateRunner: (runnerId: string) => Promise<Response<WorkflowRunner>>;
  timerOption: WorkflowTaskTimer;
  runnerId: string;
  runnerEnabled: boolean;
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
      marginTop: theme.spacing(1),
    }
  }));

export const DialogTitle = (props: DefineDialogTitleProps) => {
  const classes = useStyles();
  const {
    children,
    onClose,
    ...other
  } = props;
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
  const {
    timerOption,
    runnerId,
    runnerEnabled,
    editTimerOfRunner,
    updateRunner,
  } = props;
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const styles = useStyles();
  const inputRef = useRef<TextFieldProps>();
  const [value, setValue] = useState(timerOption.schedule ?? '* * * * *')
  const [enabled, setEnabled] = useState(timerOption.enable);
  const [, onError] = useState<CronError>();
  const customSetValue = (newValue: string) => {
    setValue(newValue)
  };

  const onConfirm = () => {
    editTimerOfRunner(runnerId, {
      enable: enabled,
      schedule: value,
    }).then(() => {
      updateRunner(runnerId);
      setTimeout(() => {
        setOpen(false);
      }, .5e3);
    });
  };

  useEffect(() => {
    if (timerOption.schedule) {
      setValue(timerOption.schedule);
    }
    setEnabled(Boolean(timerOption.enable));
  }, [timerOption]);

  return (
    <>
      <Tooltip title={t('timer')}>
        <IconButton size="small" onClick={() => setOpen(true)}>
          { props.renderButton?.() || <TimerIcon /> }
        </IconButton>
      </Tooltip>
      <AdaptiveDialog onClose={() => setOpen(false)} open={open} fullWidth maxWidth="sm">
        <DialogTitle onClose={() => setOpen(false)}>{t('set_timed_execution_rule')}</DialogTitle>
        <DialogContent className={styles.dialogContent}>
          <List>
            <ListItem>
              <ListItemText
                primary={
                  <Tooltip title={value} placement="bottom" arrow >
                    <TextField
                      value={`${value} [crontab]`}
                      inputRef={inputRef}
                      disabled
                      onChange={(event: any) => {
                        customSetValue(event.target.value)
                      }}
                    />
                  </Tooltip>
                }
              />
              <ListItemSecondaryAction>
                <Tooltip
                  title={enabled ? t('enabled') : t('disabled')}
                >
                  <IconButton size="small">
                    <Switch
                      color="primary"
                      checked={enabled}
                      disabled={!runnerEnabled}
                      onChange={(e, checked: boolean) => setEnabled(checked)}
                    />
                  </IconButton>
                </Tooltip>
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <Cron
                value={value}
                setValue={customSetValue}
                onError={onError}
              />
            </ListItem>
          </List>
          <Divider />
          <DialogActions>
            <Button
              color="primary"
              startIcon={<SaveIcon />}
              onClick={onConfirm}
            >
              {t('save')}
            </Button>
          </DialogActions>
        </DialogContent>
      </AdaptiveDialog>
    </>
  );
};

export default WorkflowScheduleDialog;
