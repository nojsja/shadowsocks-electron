import React, { useCallback, useRef, useState } from 'react';
import { ListItemProps, List } from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { Config, GroupConfig, CloseOptions } from '@renderer/types';

import {
  moveConfig,
  generateUrlFromConfig,
} from '@renderer/redux/actions/config';
import { SET_SETTING } from '@renderer/redux/actions/settings';
import { REMOVE_CONFIG } from '@renderer/redux/actions/config';

import useDialogConfirm from '@renderer/hooks/useDialogConfirm';
import { Message } from '@renderer/hooks/useNotifier';
import If from '@renderer/components/HOC/IF';
import GradientDivider from '@renderer/components/Pices/GradientDivider';

import { scrollBarStyle } from '@renderer/pages/style';

import ServerListItem from './ServerListItem';
import ConfShareDialog from './ConfShareDialog';

import { findAndCallback } from '@renderer/utils';
import NoRecord from '@renderer/components/Pices/NoRecord';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    list: {
      width: '100%',
      flex: 1,
      overflowY: 'auto',
      marginTop: theme.spacing(1),
    },
    scrollbar: scrollBarStyle(6, 0, theme),
    empty: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
  }),
);

export interface ServerListProps extends ListItemProps {
  config: (Config | GroupConfig)[];
  selectedServer: string | undefined | null;
  connected: boolean;
  onEdit?: (key: string) => void;
  onShare?: (key: string) => void;
  onRemove?: (key: string) => void;
  handleServerConnect: (key: string) => void;
  handleEditButtonClick: (key: string) => void;
}

const ServerList: React.FC<ServerListProps> = (props) => {
  const dispatch = useDispatch();
  const styles = useStyles();
  const dragTarget = useRef<string | null>(null);
  const dragSource = useRef<string | null>(null);
  const [openDialog] = useDialogConfirm();
  const removingServerId = useRef<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareData, setShareData] = useState({ url: '', dataUrl: '' });
  const { t } = useTranslation();

  const {
    config,
    connected,
    selectedServer,
    handleEditButtonClick,
    handleServerConnect,
  } = props;

  const handleRemoveButtonClick = useCallback(
    (id: string) => {
      if (id === selectedServer) {
        return Message.warning(t('cannot_remove_selected_server'));
      }

      removingServerId.current = id;
      openDialog({
        title: t('remove_this_server?'),
        content: t('this_action_cannot_be_undone'),
        onConfirm() {
          dispatch({
            type: REMOVE_CONFIG,
            config: null,
            id: removingServerId.current,
          });
          Message.success(t('removed_a_server'));
          removingServerId.current = null;
        },
        onClose() {
          removingServerId.current = null;
        },
      });
    },
    [selectedServer],
  );

  const handleShareButtonClick = useCallback(
    (id: string) => {
      findAndCallback(config, id, (conf: Config) => {
        setShareDialogOpen(true);
        generateUrlFromConfig(conf).then((rsp) => {
          if (rsp.code === 200) {
            setShareData({
              url: rsp.result.url,
              dataUrl: rsp.result.dataUrl,
            });
          }
        });
      });
    },
    [config],
  );

  const handleServerSelect = useCallback((id: string) => {
    dispatch({
      type: SET_SETTING,
      key: 'selectedServer',
      value: id,
    });
  }, []);

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
      dragTarget.current === dragSource.current ||
      !dragSource.current ||
      !dragTarget.current
    )
      return;
    dispatch(moveConfig(dragSource.current, dragTarget.current));
    setDragSource(null);
    setDragTarget(null);
  };

  return (
    <>
      <If
        condition={!!config.length}
        then={
          <>
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
          </>
        }
        else={
          <div className={styles.empty}>
            <NoRecord title="No Server" />
          </div>
        }
      />

      <ConfShareDialog
        dataUrl={shareData.dataUrl}
        url={shareData.url}
        open={shareDialogOpen}
        onClose={handleDialogClose}
      />
    </>
  );
};

export default React.memo(ServerList);
