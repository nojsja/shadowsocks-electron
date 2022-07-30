import React from 'react';
import {
  Theme,
  ButtonGroup,
  Fab,
  Button
} from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { useDispatch } from "react-redux";
import AddIcon from "@material-ui/icons/Add";
import { useTranslation } from 'react-i18next';

import { Mode } from "../types";
import { SET_SETTING } from '../redux/actions/settings';
import { dispatchAction } from '../hooks/useGlobalAction';

type StatusBarProps = {
  mode: string,
  setDialogOpen: (status: boolean) => void
};

const menuItems = ["Global", "PAC", "Manual"];

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    fabPlaceholder: {
      height: theme.spacing(5)
    },
    fabs: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      "& > *": {
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2)
      },
      position: "fixed",
      bottom: theme.spacing(2.5),
      right: 0,
      left: theme.spacing(-1),
    },
    button: {
      color: theme.palette.primary.light,
    },
    noShadow: {
      backgroundColor: 'transparent',
      boxShadow: 'none'
    },
  })
);

const FooterBar: React.FC<StatusBarProps> =  (props) => {
  const styles = useStyles();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { mode, setDialogOpen } = props;

  const handleModeChange = ((value: string) => {
    if (value === mode) return;
    dispatch({
      type: SET_SETTING,
      key: "mode",
      value: value as Mode
    });
    if (value === 'PAC') {
      return dispatchAction({ type: 'reconnect-pac', payload: { enable: true } });
    }
    if (mode === 'PAC') {
      return dispatchAction({ type: 'reconnect-pac', payload: { enable: false } });
    }
  });

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  return (
    <>
      <div className={styles.fabPlaceholder} />
      <div className={styles.fabs}>
        <Fab size="small" color="secondary" className={styles.noShadow} variant="circular" onClick={handleDialogOpen}>
          <AddIcon />
        </Fab>
        <span>

          <ButtonGroup size="small" aria-label="small outlined button group">
            {
              menuItems.map(value => (
                <Button
                  key={value}
                  variant="text"
                  className={mode === value ? styles.button : undefined}
                  onClick={() => handleModeChange(value)}
                >
                  {t(value.toLocaleLowerCase())}
                </Button>
              ))
            }
          </ButtonGroup>
        </span>
      </div>
    </>
  );
};

export default FooterBar;
