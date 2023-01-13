import React, { useState, useLayoutEffect, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
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
} from '@material-ui/core';
import {
  useTheme,
  makeStyles,
  createStyles,
  Theme,
  withStyles
} from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import CloseIcon from '@material-ui/icons/Close';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import clsx from 'clsx';

import {
  Config, encryptMethods, plugins,
  serverTypes, protocols, obfs,
  SSRConfig,
} from '../../types';
import { AdaptiveAppBar } from '../../components/Pices/AppBar';
import { scrollBarStyle } from '../../pages/styles';
import { TextWithTooltip } from '../../components/Pices/TextWithTooltip';
import If from '../../components/HOC/IF';
import OpenPluginsDir from '../settings/OpenPluginsDir';

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
  const { open, onClose, defaultValues, onValues } = props;
  const [values, setValues] = useState<Partial<Config>>(
    defaultValues ?? {
      timeout: 60,
      encryptMethod: "none",
      type: 'ss'
    }
  );
  const form = useForm<Config>({
    defaultValues: {
      type: values?.type || 'ss',
      remark: values?.remark || '',
      serverHost: values?.serverHost || '',
      serverPort: values?.serverPort || 0,
      password: values?.password || '',
      encryptMethod: values?.encryptMethod || 'none',
      protocol: (values as SSRConfig)?.protocol || 'origin',
      protocolParam: (values as SSRConfig)?.protocolParam || '',
      obfs: (values as SSRConfig)?.obfs || 'plain',
      obfsParam: (values as SSRConfig)?.obfsParam || '',
      timeout: values?.timeout ?? 60,
      plugin: values?.plugin || '',
      pluginOpts: values?.pluginOpts || '',
      definedPlugin: values?.definedPlugin || '',
      definedPluginOpts: values?.definedPluginOpts || '',
      definedPluginSIP003: values?.definedPluginSIP003 || '',
      definedPluginOptsSIP003: values?.definedPluginOptsSIP003 || '',
      fastOpen: !!values?.fastOpen,
      noDelay: !!values?.noDelay,
      udp: !!values?.udp,
    }
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  /* -------------- Functions -------------- */

  const handleCancel = () => {
    onValues(null);
  };

  const handleAdd = () => {
    form
      .trigger().then((sucess) => {
        if (sucess) {
          onValues({
            ...form.getValues(),
            id: defaultValues?.id ?? ''
          });
        }
      })
      .catch(errors => {
        console.error(errors);
      });
  };

  const handleClickShowPassword = () => {
    setShowPassword(v => !v);
  };

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  // const onFieldsChange = useCallback((changedValues: FieldData[]) => {
  //   setErrors(
  //     changedValues
  //       .filter((field) => field.errors?.length)
  //       .reduce<{ [key: string]: string }>((total, cur) => {
  //         if (cur.errors?.length) {
  //           total[cur.name.toString()] = cur.errors[0];
  //         }
  //         return total;
  //       }, {}));
  // }, []);

  /* -------------- Effects -------------- */

  useEffect(() => {
    if (!open) {
      setErrors({});
    }
  }, [open]);

  useLayoutEffect(() => {
    setValues(
      defaultValues ?? {
        timeout: 60,
        encryptMethod: "none",
        type: 'ss'
      }
    );
  }, [defaultValues]);

  /* -------------- Computed -------------- */

  const serverType = form.watch('type');
  const pluginInfo = form.watch('plugin');

  const embededPluginEnabled = pluginInfo && (pluginInfo !== 'define' && pluginInfo !== 'define_sip003');
  const definedPluginEnabled = pluginInfo && pluginInfo === 'define';
  const definedSIP003PluginEnabled = pluginInfo && pluginInfo === 'define_sip003';
  const isSSR = serverType === 'ssr';
  const isSS = serverType === 'ss';

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
            {t('edit_server')}
          </Typography>
          <Button color="inherit" onClick={handleAdd}>
            {t('save')}
          </Button>
        </Toolbar>
      </AdaptiveAppBar>

      <form>
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
            {
            ...form.register('type', {
              required: true,
            })
            }
            onChange={(e) => ((e.target.value as string)?.trim())}
            label={t('server_type')}
            displayEmpty
            fullWidth
          >
            {serverTypes.map(serverType => (
              <MenuItem key={serverType} value={serverType}>
                {serverType}
              </MenuItem>
            ))}
          </Select>

          <TextField
            {
            ...form.register('remark')
            }
            fullWidth
            onChange={(e) => ((e.target.value as string)?.trim())}
            label={t('remark')}
          />

          <TextField
            {
            ...form.register('serverHost', {
              required: true,
            })
            }
            required
            fullWidth
            error={!!errors.serverHost}
            label={t('server_address')}
          />

          <TextField
            {
            ...form.register('serverPort', {
              required: true,
              min: 1,
              max: 65535,
            })
            }
            placeholder="0-65535"
            required
            fullWidth
            type="number"
            error={!!errors.serverPort}
            label={t('server_port')}
          />

          <FormControl required fullWidth>
            <InputLabel shrink htmlFor="password">{t('password')}</InputLabel>
            <Input
              {
              ...form.register('password')
              }
              onChange={(e) => (e.target.value?.trim())}
              id="password"
              type={showPassword ? "text" : "password"}
              error={!!errors.password}
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
            {
            ...form.register('encryptMethod', {
              required: true,
            })
            }
            onChange={(e) => ((e.target.value as string)?.trim())}
            required
            label={t('encryption')}
            displayEmpty
            error={!!errors.encryptMethod}
            fullWidth
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
                  {
                  ...form.register('protocol', {
                    required: true,
                  })
                  }
                  onChange={(e) => ((e.target.value as string)?.trim())}
                  required
                  label={t('protocol')}
                  displayEmpty
                  fullWidth
                >
                  {protocols.map(protocol => (
                    <MenuItem key={protocol} value={protocol}>
                      {protocol}
                    </MenuItem>
                  ))}
                </Select>
                <TextField
                  {
                  ...form.register('protocolParam')
                  }
                  onChange={(e) => (e.target.value?.trim())}
                  fullWidth
                  label={t('protocolParam')}
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
                  {
                  ...form.register('obfs', {
                    required: true,
                  })
                  }
                  onChange={(e) => ((e.target.value as string)?.trim())}
                  required
                  label={t('obfs')}
                  displayEmpty
                  fullWidth
                >
                  {obfs.map(value => (
                    <MenuItem key={value} value={value}>
                      {value}
                    </MenuItem>
                  ))}
                </Select>
                <TextField
                  {
                  ...form.register('obfsParam')
                  }
                  onChange={(e) => (e.target.value?.trim())}
                  fullWidth
                  label={t('obfsParam')}
                />
              </>
            }
          />

          <TextField
            {
            ...form.register('timeout', {
              required: true,
              min: 1,
            })
            }
            onChange={(e) => (e.target.value?.trim())}
            required
            fullWidth
            error={!!errors.timeout}
            label={t('timeout')}
          />

          <InputLabel shrink style={{ marginBottom: 0 }}><TextWithTooltip text={t('plugin')} tooltip={t('readme')} /></InputLabel>
          <Select
            {
            ...form.register('plugin')
            }
            onChange={(e) => ((e.target.value as string)?.trim())}
            label={t('plugin')}
            displayEmpty
            fullWidth
          >
            <MenuItem key="none" value="">
              <em>{t('none')}</em>
            </MenuItem>
            {
              isSS && plugins.map(plugin => (
                <MenuItem key={plugin.name} value={plugin.name}>
                  <TextWithTooltip text={plugin.label} tooltip={t(`${plugin.tips}`)} />
                </MenuItem>
              ))
            }
            {
              isSS && (
                <MenuItem key="define_sip003" value="define_sip003">
                  <TextWithTooltip
                    text={<em>{t('customize_plugin_sip003')}</em>}
                    tooltip={t('customize_plugin_tips_sip003')}
                  />
                </MenuItem>
              )
            }
            <MenuItem key="define" value="define">
              <TextWithTooltip
                text={<em>{t('customize_plugin')}</em>}
                tooltip={t('customize_plugin_tips')}
              />
            </MenuItem>
          </Select>

          {
            embededPluginEnabled && (
              <TextField
                {
                ...form.register('pluginOpts')
                }
                onChange={(e) => (e.target.value?.trim())}
                fullWidth
                multiline
                label={t('plugin_options')}
              />
            )
          }
          {
            definedPluginEnabled && (
              <TextField
                {
                ...form.register('definedPlugin')
                }
                onChange={(e) => (e.target.value?.trim())}
                fullWidth
                label={`${t('plugin_path')}[define]`}
              />
            )
          }
          {
            definedPluginEnabled && (
              <TextField
                {
                ...form.register('definedPluginOpts')
                }
                onChange={(e) => (e.target.value?.trim())}
                fullWidth
                multiline
                label={`${t('plugin_options')}[define]`}
              />
            )
          }
          {
            definedSIP003PluginEnabled && (
              <TextField
                {
                ...form.register('definedPluginSIP003')
                }
                onChange={(e) => (e.target.value?.trim())}
                fullWidth
                label={`${t('plugin_path')}[define_sip003]`}
              />
            )
          }
          {
            definedSIP003PluginEnabled && (
              <TextField
                {
                ...form.register('definedPluginOptsSIP003')
                }
                onChange={(e) => (e.target.value?.trim())}
                fullWidth
                multiline
                label={`${t('plugin_options')}[define_sip003]`}
              />
            )
          }

          <List>
            <OpenPluginsDir />
            <ListItem>
              <ListItemText primary="TCP Fast Open" />
              <ListItemSecondaryAction>
                <Controller
                  control={form.control}
                  name="fastOpen"
                  render={({ field }) => (
                    <Switch
                      edge="end"
                      color="primary"
                      checked={field.value}
                    />
                  )}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <If
              condition={isSS}
              then={
                <ListItem>
                  <ListItemText primary="TCP No Delay" />
                  <ListItemSecondaryAction>
                    <Controller
                      control={form.control}
                      name="noDelay"
                      render={({ field }) => (
                        <Switch
                          edge="end"
                          color="primary"
                          checked={field.value}
                        />
                      )}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              }
            />
            <ListItem>
              <ListItemText primary="UDP Relay" />
              <ListItemSecondaryAction>
                <Controller
                  control={form.control}
                  name="udp"
                  render={({ field }) => (
                    <Switch
                      edge="end"
                      color="primary"
                      checked={field.value}
                    />
                  )}
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </Container>
      </form>
    </StyledDialog>
  );
};

export default EditServerDialog;
