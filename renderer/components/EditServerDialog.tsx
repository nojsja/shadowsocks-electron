import React, { useState, useEffect } from "react";
import {
  Dialog,
  TextField,
  DialogProps,
  useMediaQuery,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Container,
  ListItem,
  ListItemText,
  Switch,
  ListItemSecondaryAction,
  List,
  Select,
  MenuItem,
  InputLabel,
  InputAdornment,
  Input,
  FormControl
} from "@material-ui/core";
import {
  useTheme,
  makeStyles,
  createStyles,
  Theme
} from "@material-ui/core/styles";
import { useTranslation } from 'react-i18next';
import CloseIcon from "@material-ui/icons/Close";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";

import { Config, encryptMethods, plugins } from "../types";
import useSnackbarAlert from '../hooks/useSnackbarAlert';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appBar: {
      position: "fixed"
    },
    appBarRelative: {
      position: "relative"
    },
    title: {
      marginLeft: theme.spacing(2),
      flex: 1
    },
    toolbar: theme.mixins.toolbar,
    container: {
      padding: theme.spacing(2),
      paddingTop: 0,
      paddingBottom: theme.spacing(4),
      "& > *": {
        marginTop: theme.spacing(1.5),
        marginBottom: theme.spacing(1.5)
      }
    }
  })
);

export interface EditServerDialogProps extends DialogProps {
  defaultValues: Config | null;
  onValues: (values: Config | null) => void;
}

const EditServerDialog: React.FC<EditServerDialogProps> = props => {
  const styles = useStyles();
  const { t } = useTranslation();

  const { open, onClose, defaultValues, onValues } = props;

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [SnackbarAlert, setSnackbarMessage] = useSnackbarAlert();

  const [values, setValues] = useState<Partial<Config>>(
    defaultValues ?? {
      timeout: 60,
      encryptMethod: "xchacha20-ietf-poly1305"
    }
  );

  useEffect(() => {
    setValues(
      defaultValues ?? {
        timeout: 60,
        encryptMethod: "xchacha20-ietf-poly1305"
      }
    );
  }, [defaultValues]);

  const handleValueChange = (
    key: keyof Config,
    value: boolean | string | number
  ) => {
    setValues({
      ...values,
      // [key]: e.target[attr || 'value'].trim()
      [key]: value
    });
  };

  const handleCancel = () => {
    onValues(null);
  };

  const handleAdd = () => {
    if (!values.serverHost) {
      setSnackbarMessage(t("invalid_server_address"));
      return;
    }
    if (
      !(
        values.serverPort &&
        values.serverPort > 0 &&
        values.serverPort <= 65535
      )
    ) {
      setSnackbarMessage(t("invalid_server_port"));
      return;
    }
    if (!values.password) {
      setSnackbarMessage(t("invalid_password"));
      return;
    }
    if (!values.timeout) {
      setSnackbarMessage(t("invalid_timeout"));
      return;
    }

    onValues(values as Config);
  };

  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(v => !v);
  };

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  return (
    <Dialog
      fullScreen={fullScreen}
      open={open}
      onClose={onClose}
      disableBackdropClick
    >
      <AppBar className={fullScreen ? styles.appBar : styles.appBarRelative}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleCancel}>
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" className={styles.title}>
            { t('edit_server') }
          </Typography>
          <Button color="inherit" onClick={handleAdd}>
            { t('save') }
          </Button>
        </Toolbar>
      </AppBar>
      <Container className={styles.container}>
        {fullScreen && <div className={styles.toolbar} />}
        <TextField
          fullWidth
          label={t('remark')}
          value={values.remark ?? ""}
          onChange={e => handleValueChange("remark", e.target.value.trim())}
        />
        <TextField
          required
          fullWidth
          label={t('server_address')}
          value={values.serverHost ?? ""}
          onChange={e => handleValueChange("serverHost", e.target.value.trim())}
        />
        <TextField
          required
          fullWidth
          type="number"
          label={t('server_port')}
          value={values.serverPort ?? ""}
          onChange={e => handleValueChange("serverPort", e.target.value.trim())}
        />
        <FormControl required fullWidth>
          <InputLabel htmlFor="password">{t('password')}</InputLabel>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={values.password ?? ""}
            onChange={e => handleValueChange("password", e.target.value.trim())}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                >
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
        <InputLabel required style={{ marginBottom: 0 }}>
          {t('encryption')}
        </InputLabel>
        <Select
          required
          label={t('encryption')}
          displayEmpty
          fullWidth
          value={values.encryptMethod ?? "xchacha20-ietf-poly1305"}
          onChange={(e: any) => handleValueChange("encryptMethod", e.target.value.trim())}
        >
          {encryptMethods.map(method => (
            <MenuItem key={method} value={method}>
              {method}
            </MenuItem>
          ))}
        </Select>
        <TextField
          required
          fullWidth
          label={t('timeout')}
          value={values.timeout ?? 60}
          onChange={e => handleValueChange("timeout", e.target.value)}
        />
        <List>
          <ListItem>
            <ListItemText primary="TCP Fast Open" />
            <ListItemSecondaryAction>
              <Switch checked={!!values.fastOpen} edge="end" color="primary" onChange={(e) => handleValueChange('fastOpen', e.target.checked)} />
            </ListItemSecondaryAction>
          </ListItem>
          {
            values.type === 'ss' && (
              <ListItem>
                <ListItemText primary="TCP No Delay" />
                <ListItemSecondaryAction>
                  <Switch checked={!!values.noDelay} edge="end" color="primary" onChange={(e) => handleValueChange('noDelay', e.target.checked)} />
                </ListItemSecondaryAction>
              </ListItem>
            )
          }
          <ListItem>
            <ListItemText primary="UDP Relay" />
            <ListItemSecondaryAction>
              <Switch checked={!!values.udp} edge="end" color="primary" onChange={(e) => handleValueChange('udp', e.target.checked)} />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
        <InputLabel style={{ marginBottom: 0 }}>{t('plugin')}</InputLabel>
        {
          values.type === 'ss' && (
            <>
              <Select
                label={t('plugin')}
                displayEmpty
                fullWidth
                value={values.plugin ?? ""}
                onChange={(e: any) => handleValueChange("plugin", e.target.value.trim())}
              >
                <MenuItem key="none" value="">
                  <em>{t('none')}</em>
                </MenuItem>
                {plugins.map(plugin => (
                  <MenuItem key={plugin} value={plugin}>
                    {plugin}
                  </MenuItem>
                ))}
              </Select>
              <TextField
                fullWidth
                multiline
                label={t('plugin_options')}
                value={values.pluginOpts ?? ""}
                onChange={e => handleValueChange("pluginOpts", e.target.value.trim())}
              />
            </>
          )
        }
      </Container>
      { SnackbarAlert }
    </Dialog>
  );
};

export default EditServerDialog;
