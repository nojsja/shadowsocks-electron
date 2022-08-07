import React, { useState, useLayoutEffect } from "react";
import {
  TextField,
  DialogProps,
  useMediaQuery,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Container,
  Dialog,
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
  Theme,
  withStyles
} from "@material-ui/core/styles";
import { useTranslation } from 'react-i18next';
import CloseIcon from "@material-ui/icons/Close";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import { SnackbarMessage } from 'notistack';
import { useDispatch } from "react-redux";
import clsx from "clsx";

import { enqueueSnackbar as enqueueSnackbarAction } from '../../redux/actions/notifications';
import { Config, encryptMethods, plugins, serverTypes, protocols, obfs, Notification } from "../../types";
import { AdaptiveAppBar } from "../../components/Pices/AppBar";
import { scrollBarStyle } from "../../pages/styles";
import { TextWithTooltip } from "../../components/Pices/TextWithTooltip";
import If from "../../components/HOC/IF";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    disableDrag: {
      '-webkit-app-region': 'none',
    },
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
  const dispatch = useDispatch();

  const { open, onClose, defaultValues, onValues } = props;

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const enqueueSnackbar = (message: SnackbarMessage, options: Notification) => {
    dispatch(enqueueSnackbarAction(message, options))
  };

  const [values, setValues] = useState<Partial<Config>>(
    defaultValues ?? {
      timeout: 60,
      encryptMethod: "none",
      type: 'ss'
    }
  );

  useLayoutEffect(() => {
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
      [key]: value
    });
  };

  const handleCancel = () => {
    onValues(null);
  };

  const handleAdd = () => {
    if (!values.serverHost) {
      enqueueSnackbar(t("invalid_server_address"), { variant: "warning" });
      return;
    }
    if (
      !(
        values.serverPort &&
        values.serverPort > 0 &&
        values.serverPort <= 65535
      )
    ) {
      enqueueSnackbar(t("invalid_server_port"), { variant: "warning" });
      return;
    }
    if (!values.password) {
      enqueueSnackbar(t("invalid_password"), { variant: "warning" });
      return;
    }
    if (!values.timeout) {
      enqueueSnackbar(t("invalid_timeout"), { variant: "warning" });
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
      <AdaptiveAppBar className={clsx(fullScreen ? styles.appBar : styles.appBarRelative, styles.disableDrag)}>
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
        <If
          condition={fullScreen}
          then={<div className={`${styles.toolbar}`} />}
        />
        <InputLabel required style={{ marginBottom: 0 }} shrink>
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
          <InputLabel shrink htmlFor="password">{t('password')}</InputLabel>
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
        <InputLabel shrink required style={{ marginBottom: 0 }}>
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
        <If
          condition={isSSR}
          then={
            <>
              <InputLabel shrink required style={{ marginBottom: 0 }}>
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
          }
        />
        <If
          condition={isSSR}
          then={
            <>
              <InputLabel shrink required style={{ marginBottom: 0 }}>
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
          }
        />
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
          <If
            condition={isSS}
            then={
              <ListItem>
                <ListItemText primary="TCP No Delay" />
                <ListItemSecondaryAction>
                  <Switch checked={!!values.noDelay} edge="end" color="primary" onChange={(e) => handleValueChange('noDelay', e.target.checked)} />
                </ListItemSecondaryAction>
              </ListItem>
            }
          />
          <ListItem>
            <ListItemText primary="UDP Relay" />
            <ListItemSecondaryAction>
              <Switch checked={!!values.udp} edge="end" color="primary" onChange={(e) => handleValueChange('udp', e.target.checked)} />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
        <InputLabel shrink style={{ marginBottom: 0 }}><TextWithTooltip text={t('plugin')} tooltip={t('readme')} /></InputLabel>
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
          {
            isSS && plugins.map(plugin => (
              <MenuItem key={plugin.name} value={plugin.name}>
                {plugin.name} {plugin.tips ? `(${t(plugin.tips)})` : ""}
              </MenuItem>
            ))
          }
          <MenuItem key="define" value="define">
            <TextWithTooltip
              text={<em>{t('customize_plugin')}</em>}
              tooltip={t('customize_plugin_tips')}
            />
          </MenuItem>
        </Select>
        {
          (values.plugin && (values.plugin !== 'define')) && (
            <TextField
              fullWidth
              multiline
              label={t('plugin_options')}
              value={values.pluginOpts ?? ""}
              onChange={e => handleValueChange("pluginOpts", e.target.value.trim())}
            />
          )
        }
        {
          (values.plugin === 'define') && (
            <TextField
              fullWidth
              label={t('plugin_path')}
              value={values.definedPlugin ?? ""}
              onChange={e => handleValueChange("definedPlugin", e.target.value.trim())}
            />
          )
        }
        {
          (values.plugin === 'define') && (
            <TextField
              fullWidth
              multiline
              label={t('plugin_options')}
              value={values.definedPluginOpts ?? ""}
              onChange={e => handleValueChange("definedPluginOpts", e.target.value.trim())}
            />
          )
        }
      </Container>
    </StyledDialog>
  );
};

export default EditServerDialog;
