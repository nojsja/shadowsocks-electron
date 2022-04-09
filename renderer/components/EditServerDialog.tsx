import React, { useState, useEffect } from "react";
import {
  Dialog,
  TextField,
  DialogProps,
  useMediaQuery,
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
  withStyles,
  Theme
} from "@material-ui/core/styles";
import { useTranslation } from 'react-i18next';
import CloseIcon from "@material-ui/icons/Close";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";

import { Config, encryptMethods, plugins, serverTypes, protocols, obfs } from "../types";
import useSnackbarAlert from '../hooks/useSnackbarAlert';
import { AdaptiveAppBar } from "./Pices/AppBar";
import { scrollBarStyle } from "../pages/styles";
import { TextWithTooltip } from "./Pices/TextWithTooltip";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appBar: {
      position: "fixed"
    },
    appBarRelative: {
      position: "relative"
    },
    scrollbar: scrollBarStyle(6, 0, theme),
    title: {
      marginLeft: theme.spacing(2),
      flex: 1
    },
    toolbar: theme.mixins.toolbar,
    container: {
      padding: theme.spacing(2),
      paddingTop: 0,
      paddingBottom: theme.spacing(4),
      backgroundColor: theme.palette.type === "dark" ? 'rgba(255,255,255, .2)' : 'rgba(255, 255, 255, 1)',
      "& > *": {
        marginTop: theme.spacing(1.5),
        marginBottom: theme.spacing(1.5)
      }
    }
  })
);

const StyledDialog = withStyles((theme: Theme) => (
  createStyles({
    paper: {
    },
    root: {
      '& *': scrollBarStyle(6, 0, theme)
    }
  })
))(Dialog);

export interface EditServerDialogProps extends DialogProps {
  defaultValues: Config | null | undefined;
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
      encryptMethod: "none",
      type: 'ss'
    }
  );

  useEffect(() => {
    setValues(
      defaultValues ?? {
        timeout: 60,
        encryptMethod: "none",
        type: 'ss'
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

  const isSSR = values.type === 'ssr';
  const isSS = values.type === 'ss';

  return (
    <StyledDialog
      fullScreen={fullScreen}
      open={open}
      onClose={onClose}
    >
      <AdaptiveAppBar className={fullScreen ? styles.appBar : styles.appBarRelative}>
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
      </AdaptiveAppBar>
      <Container className={`${styles.container}`}>
        {fullScreen && <div className={`${styles.toolbar}`} />}
        <InputLabel required style={{ marginBottom: 0 }}>
          {t('server_type')}
        </InputLabel>
        <Select
          required
          label={t('server_type')}
          displayEmpty
          fullWidth
          value={values.type ?? "ss"}
          onChange={(e: any) => handleValueChange("type", e.target.value.trim())}
        >
          {serverTypes.map(serverType => (
            <MenuItem key={serverType} value={serverType}>
              {serverType}
            </MenuItem>
          ))}
        </Select>
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
          value={values.encryptMethod ?? "none"}
          onChange={(e: any) => handleValueChange("encryptMethod", e.target.value.trim())}
        >
          {encryptMethods.map(method => (
            <MenuItem key={method} value={method}>
              {method}
            </MenuItem>
          ))}
        </Select>
        {
          isSSR && (
            <>
              <InputLabel required style={{ marginBottom: 0 }}>
                {t('protocol')}
              </InputLabel>
              <Select
                required
                label={t('protocol')}
                displayEmpty
                fullWidth
                value={values.protocol ?? "origin"}
                onChange={(e: any) => handleValueChange("protocol", e.target.value.trim())}
              >
                {protocols.map(protocol => (
                  <MenuItem key={protocol} value={protocol}>
                    {protocol}
                  </MenuItem>
                ))}
              </Select>
              <TextField
                fullWidth
                label={t('protocolParam')}
                value={values.protocolParam ?? ""}
                onChange={e => handleValueChange("protocolParam", e.target.value.trim())}
              />
            </>
          )
        }
        {
          isSSR && (
            <>
              <InputLabel required style={{ marginBottom: 0 }}>
                {t('obfs')}
              </InputLabel>
              <Select
                required
                label={t('obfs')}
                displayEmpty
                fullWidth
                value={values.obfs ?? "plain"}
                onChange={(e: any) => handleValueChange("obfs", e.target.value.trim())}
              >
                {obfs.map(value => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </Select>
              <TextField
                fullWidth
                label={t('obfsParam')}
                value={values.obfsParam ?? ""}
                onChange={e => handleValueChange("obfsParam", e.target.value.trim())}
              />
            </>
          )
        }
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
            isSS && (
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
        <InputLabel style={{ marginBottom: 0 }}><TextWithTooltip text={t('plugin')} tooltip={t('readme')} /></InputLabel>
        {
          isSS && (
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
                  <MenuItem key={plugin.name} value={plugin.name}>
                    {plugin.name} {plugin.tips ? `(${t(plugin.tips)})` : ""}
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
    </StyledDialog>
  );
};

export default EditServerDialog;
