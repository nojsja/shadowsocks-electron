import React, { useState, useLayoutEffect, useCallback, useEffect } from "react";
import Form, { Field, useForm } from "rc-field-form";
import { FieldData } from "rc-field-form/es/interface";

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
import clsx from "clsx";

import { Config, encryptMethods, plugins, serverTypes, protocols, obfs } from "../../types";
import { AdaptiveAppBar } from "../../components/Pices/AppBar";
import { scrollBarStyle } from "../../pages/styles";
import { TextWithTooltip } from "../../components/Pices/TextWithTooltip";
import If from "../../components/HOC/IF";
import OpenPluginsDir from "../settings/OpenPluginsDir";

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
  const [form] = useForm();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { open, onClose, defaultValues, onValues } = props;

  const [values, setValues] = useState<Partial<Config>>(
    defaultValues ?? {
      timeout: 60,
      encryptMethod: "none",
      type: 'ss'
    }
  );

  /* -------------- Functions -------------- */

  const handleCancel = () => {
    onValues(null);
  };

  const handleAdd = () => {
    form.validateFields()
    .then((values: Config) => {
      onValues({
        ...values,
        id: defaultValues?.id ?? ''
      });
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

  const onFieldsChange = useCallback((changedValues: FieldData[]) => {
    setErrors(
      changedValues
        .filter((field) => field.errors?.length)
        .reduce<{ [key: string]: string }>((total, cur) => {
          if (cur.errors?.length) {
            total[cur.name.toString()] = cur.errors[0];
          }
          return total;
        }, {}));
  }, []);

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

  const serverType = Form.useWatch(['type'], form);
  const pluginInfo = Form.useWatch(['plugin'], form);

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

      <Form<Config>
        form={form}
        onFieldsChange={onFieldsChange}
        initialValues={{
          type: values?.type || 'ss',
          remark: values?.remark || '',
          serverHost: values?.serverHost || '',
          serverPort: values?.serverPort || '',
          password: values?.password || '',
          encryptMethod: values?.encryptMethod || 'none',
          protocol: values?.protocol || 'origin',
          protocolParam: values?.protocolParam || '',
          obfs: values?.obfs || 'plain',
          obfsParam: values?.obfsParam || '',
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
        }}
      >
        <Container className={`${styles.container}`}>
          <If
            condition={fullScreen}
            then={<div className={`${styles.toolbar}`} />}
          />

          <InputLabel required style={{ marginBottom: 0 }} shrink>
            {t('server_type')}
          </InputLabel>
          <Field name="type" normalize={(value) => value.trim()}>
            <Select
              required
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
          </Field>

          <Field name="remark" normalize={(value) => value.trim()}>
            <TextField
              fullWidth
              label={t('remark')}
            />
          </Field>

          <Field
            name="serverHost"
            rules={[
              { required: true, message: t('invalid_server_address') },
            ]}
          >
            <TextField
              required
              fullWidth
              error={!!errors.serverHost}
              label={t('server_address')}
            />
          </Field>

          <Field
            name="serverPort"
            normalize={(value) => +(value.trim())}
            rules={[
              { type: 'number', min: 1, max: 65535, message: '0-65535' },
            ]}
          >
            <TextField
              required
              fullWidth
              type="number"
              error={!!errors.serverPort}
              label={t('server_port')}
            />
          </Field>

          <FormControl required fullWidth>
            <InputLabel shrink htmlFor="password">{t('password')}</InputLabel>
            <Field
              name="password"
              normalize={(value) => value.trim()}
              rules={[
                { required: true, message: t('invalid_server_port') },
              ]}
            >
              <Input
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
            </Field>
          </FormControl>

          <InputLabel shrink required style={{ marginBottom: 0 }}>
            {t('encryption')}
          </InputLabel>
          <Field
            name="encryptMethod" normalize={(value) => value.trim()}
          >
            <Select
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
          </Field>

          <If
            condition={isSSR}
            then={
              <>
                <InputLabel shrink required style={{ marginBottom: 0 }}>
                  {t('protocol')}
                </InputLabel>
                <Field name="protocol" normalize={(value) => value.trim()}>
                  <Select
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
                </Field>
                <Field name="protocolParam" normalize={(value) => value.trim()}>
                  <TextField
                    fullWidth
                    label={t('protocolParam')}
                  />
                </Field>
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
                <Field name="obfs" normalize={(value) => value.trim()}>
                  <Select
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
                </Field>
                <Field name="obfsParam" normalize={(value) => value.trim()}>
                  <TextField
                    fullWidth
                    label={t('obfsParam')}
                  />
                </Field>
              </>
            }
          />

          <Field
            name="timeout"
            normalize={(value) => +(value.trim())}
            rules={[
              { type: 'number', min: 1, message: '>0' },
            ]}
          >
            <TextField
              required
              fullWidth
              error={!!errors.timeout}
              label={t('timeout')}
            />
          </Field>

          <InputLabel shrink style={{ marginBottom: 0 }}><TextWithTooltip text={t('plugin')} tooltip={t('readme')} /></InputLabel>
          <Field name="plugin" normalize={(value) => value.trim()}>
            <Select
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
          </Field>

          {
            embededPluginEnabled && (
              <Field name="pluginOpts" normalize={(value) => value.trim()}>
                <TextField
                  fullWidth
                  multiline
                  label={t('plugin_options')}
                />
              </Field>
            )
          }
          {
            definedPluginEnabled && (
              <Field name="definedPlugin" normalize={(value) => value.trim()}>
                <TextField
                  fullWidth
                  label={`${t('plugin_path')}[define]`}
                />
              </Field>
            )
          }
          {
            definedPluginEnabled && (
              <Field name="definedPluginOpts" normalize={(value) => value.trim()}>
                <TextField
                  fullWidth
                  multiline
                  label={`${t('plugin_options')}[define]`}
                />
              </Field>
            )
          }
          {
            definedSIP003PluginEnabled && (
              <Field name="definedPluginSIP003" normalize={(value) => value.trim()}>
                <TextField
                  fullWidth
                  label={`${t('plugin_path')}[define_sip003]`}
                />
              </Field>
            )
          }
          {
            definedSIP003PluginEnabled && (
              <Field name="definedPluginOptsSIP003" normalize={(value) => value.trim()}>
                <TextField
                  fullWidth
                  multiline
                  label={`${t('plugin_options')}[define_sip003]`}
                />
              </Field>
            )
          }

          <List>
            <OpenPluginsDir />
            <ListItem>
              <ListItemText primary="TCP Fast Open" />
              <ListItemSecondaryAction>
                <Field name="fastOpen" valuePropName="checked">
                  <Switch
                    edge="end"
                    color="primary"
                  />
                </Field>
              </ListItemSecondaryAction>
            </ListItem>
            <If
              condition={isSS}
              then={
                <ListItem>
                  <ListItemText primary="TCP No Delay" />
                  <ListItemSecondaryAction>
                    <Field name="noDelay" valuePropName="checked">
                      <Switch
                        edge="end"
                        color="primary"
                      />
                    </Field>
                  </ListItemSecondaryAction>
                </ListItem>
              }
            />
            <ListItem>
              <ListItemText primary="UDP Relay" />
              <ListItemSecondaryAction>
                <Field name="udp" valuePropName="checked">
                  <Switch
                    edge="end"
                    color="primary"
                  />
                </Field>
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </Container>
        </Form>
    </StyledDialog>
  );
};

export default EditServerDialog;
