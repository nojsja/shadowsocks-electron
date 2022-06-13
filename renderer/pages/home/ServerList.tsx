import React, { useCallback, useRef, useState } from "react";
import {
  ListItemProps,
  List,
  Typography
} from "@material-ui/core";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { SnackbarMessage } from 'notistack';
import { useTranslation } from 'react-i18next';

import { Config, GroupConfig, Notification, CloseOptions } from "../../types/";

import { useDispatch } from "react-redux";
import { moveConfig, generateUrlFromConfig } from "../../redux/actions/config";
import { enqueueSnackbar as enqueueSnackbarAction } from '../../redux/actions/notifications';
import { SET_SETTING } from "../../redux/actions/settings";
import { REMOVE_CONFIG } from "../../redux/actions/config";

import ContextMenuProvider from "../../hooks/useContextMenu";
import useDialogConfirm from '../../hooks/useDialogConfirm';
import If from '../../components/HOC/IF';

import GradientDivider from "../../components/Pices/GradientDivider";
import ServerListItem from "./ServerListItem";
import ConfShareDialog from './ConfShareDialog';

import { findAndCallback } from '../../utils';

import { scrollBarStyle } from "../../pages/styles";

const useStyles = makeStyles((theme: Theme) =>

  createStyles({
    list: {
      width: "100%",
      flex: 1,
      overflowY: "auto",
      marginTop: theme.spacing(1),
    },
    scrollbar: scrollBarStyle(6, 0, theme),
    empty: {
      flex: 1,
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    },
  })
);

export interface ServerListProps extends ListItemProps {
  config: (Config | GroupConfig)[]
  selectedServer: string | undefined | null,
  connected: boolean;
  onEdit?: (key: string) => void;
  onShare?: (key: string) => void;
  onRemove?: (key: string) => void;
  handleServerConnect: (key: string) => void;
  handleEditButtonClick: (key: string) => void;
}

const ServerList: React.FC<ServerListProps> = props => {

  const dispatch = useDispatch();
  const styles = useStyles();
  const dragTarget = useRef<string | null>(null);
  const dragSource = useRef<string | null>(null);
  const [DialogConfirm, showDialog, closeDialog] = useDialogConfirm();
  const removingServerId = useRef<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareData, setShareData] = useState({ url: '', dataUrl: '' });
  const { t } = useTranslation();

  const {
    config,
    connected,
    selectedServer,
    handleEditButtonClick,
    handleServerConnect
  } = props;

  const enqueueSnackbar = (message: SnackbarMessage, options: Notification) => {
    dispatch(enqueueSnackbarAction(message, options))
  };

  const handleRemoveButtonClick = useCallback((id: string) => {
    if (id === selectedServer) {
      return enqueueSnackbar(t('cannot_remove_selected_server'), { variant: 'warning' });
    }

    removingServerId.current = id;
    showDialog(t('remove_this_server?'), t('this_action_cannot_be_undone'));
  }, [selectedServer]);

  const handleShareButtonClick = useCallback((id: string) => {
    findAndCallback(config, id, (conf: Config) => {
      setShareDialogOpen(true);
      generateUrlFromConfig(conf)
        .then(rsp => {
          if (rsp.code === 200) {
            setShareData({
              url: rsp.result.url,
              dataUrl: rsp.result.dataUrl
            });
          }
        });
    });
  }, [config]);

  const handleServerRemove = () => {
    dispatch({
      type: REMOVE_CONFIG,
      config: null as any,
      id: removingServerId.current
    });
    enqueueSnackbar(t("removed_a_server"), { variant: 'success' });

    closeDialog();
    removingServerId.current = null;
  };

  const handleServerSelect = useCallback((id: string) => {
    dispatch({
      type: SET_SETTING,
      key: "selectedServer",
      value: id
    });
  }, []);

  const handleAlertDialogClose = () => {
    closeDialog()
    removingServerId.current = null;
  };

  const handleDialogClose = (selection?: CloseOptions) => {
    switch (selection) {
      case 'share':
        setShareDialogOpen(false);
        break;
      default:
        break;
    }
  };

  const setDragTarget = (id: string | null) => {
    dragTarget.current = id;
  };

  const setDragSource = (id: string | null) => {
    dragSource.current = id;
  };

  const dragSort = () => {
    if (
      dragTarget.current === dragSource.current
      || !dragSource.current
      || !dragTarget.current
    ) return;
    dispatch(moveConfig(dragSource.current, dragTarget.current));
    setDragSource(null);
    setDragTarget(null);
  }

  return (
    <>
      <If
        condition={!!config.length}
        then={
          <ContextMenuProvider>
            <List className={`${styles.list} ${styles.scrollbar}`}>
              {config.map((item, index) => (
                <ServerListItem
                  key={item.id}
                  item={item}
                  dragTarget={dragTarget}
                  dragSort={dragSort}
                  dragSource={dragSource}
                  setDragSource={setDragSource}
                  setDragTarget={setDragTarget}
                  selectedServer={selectedServer}
                  connected={connected}
                  onShare={handleShareButtonClick}
                  onEdit={handleEditButtonClick}
                  onRemove={handleRemoveButtonClick}
                  handleServerSelect={handleServerSelect}
                  handleServerConnect={handleServerConnect}
                  isLast={index === config.length - 1}
                />
              ))}
            </List>
            <GradientDivider />
          </ContextMenuProvider>
        }
        else={
          <div className={styles.empty}>
            <Typography variant="body1" color="textSecondary">
              No Server
            </Typography>
          </div>
        }
      />
      <ConfShareDialog
        dataUrl={shareData.dataUrl}
        url={shareData.url}
        open={shareDialogOpen}
        onClose={handleDialogClose}
        children={undefined}
      />
      <DialogConfirm onClose={handleAlertDialogClose} onConfirm={handleServerRemove} />
    </>
  )

};

export default React.memo(ServerList);
