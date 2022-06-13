import React, { useState, useMemo, memo, useLayoutEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { clipboard } from "electron";
import {
  Accordion,
  AccordionDetails,
  ListItemProps,
  AccordionSummary,
  Badge
} from "@material-ui/core";
import {
  ExpandMore,
  FileCopy as CopyIcon,
  VerticalAlignTop as VerticalAlignTopIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Delete as DeleteIcon,
  Refresh,
  ViewComfy
} from '@material-ui/icons';
import { createStyles, Theme, withStyles } from "@material-ui/core/styles";
import { useDispatch } from "react-redux";
import { SnackbarMessage } from "notistack";

import { moveDown, moveUp, startClusterAction, stopClusterAction, top, updateSubscription } from "../../redux/actions/config";
import { enqueueSnackbar as enqueueSnackbarAction } from '../../redux/actions/notifications';
import ServerListItemSingle from "./ServerListItemSingle";
import { GroupConfig, Notification } from "../../types";
import menuContext from '../../hooks/useContextMenu/context';
import { useTypedSelector } from "../../redux/reducers";
import If from "../../components/HOC/IF";
import { blue, grey } from "@material-ui/core/colors";

const StyledBadge = withStyles((theme: Theme) =>
  createStyles({
    badge: {
      right: -20,
      top: 10,
      borderRadius: 3,
      padding: '0 5',
      border: `solid 1px #8f8f8f`,
      backgroundColor: 'inherit',
      color: blue[400]
    },
  }),
)(Badge);

const StyledBadgeInactive = withStyles((theme: Theme) =>
  createStyles({
    badge: {
      color: grey[400]
    },
  }),
)(StyledBadge);


const StyledAccordionDetails = withStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      paddingLeft: 0,
      paddingRight: 0,
      margin: 'auto',
      backgroundColor: theme.palette.type === "dark" ? '#383838' : '#fdfdfd',
    }
  }),
)(AccordionDetails);

const StyledAccordionSummary = withStyles((theme: Theme) => (
  createStyles({
    root: {
      minHeight: '36px',
      backgroundColor: theme.palette.type === "dark" ? '#525252' : 'rgba(255, 255, 255, 1)',
      '&.Mui-expanded': {
        minHeight: '36px',
      },
      '& .MuiAccordionSummary-content': {
        margin: '8px 0'
      },
      '& .MuiIconButton-root': {
        padding: '8px 12px',
      },
    }
  })
))(AccordionSummary);


export interface ServerListItemGroupProps extends ListItemProps {
  isLast?: boolean;
  connected: boolean;
  item: GroupConfig;
  selectedServer: string | null | undefined;
  onEdit?: (key: string) => void;
  onShare?: (key: string) => void;
  onRemove?: (key: string) => void;
  handleServerConnect: (key: string) => void;
  handleServerSelect: (key: string) => void;
}

const ServerListItemGroup: React.FC<ServerListItemGroupProps> = props => {
  const dispatch = useDispatch();
  const { item, selectedServer } = props;
  const { t } = useTranslation();
  const context = useContext(menuContext);
  const settings = useTypedSelector(state => state.settings);
  const config = useTypedSelector(state => state.config);
  const [expanded, handleChange] = useState(
    !!item.servers?.find(server => server.id === selectedServer)
    && settings.serverMode === 'single'
  );
  const { serverMode, clusterId } = settings;
  const menuContents = useMemo(() => {
    const items = [
      { label: t('copy'), action: 'copy', icon: <CopyIcon fontSize="small" /> },
      { label: t('update'), action: 'update_subscription', icon: <Refresh fontSize="small" /> },
      { label: t('top'), action: 'top', icon: <VerticalAlignTopIcon fontSize="small" />},
      { label: t('move_up'), action: 'move_up', icon: <ArrowUpwardIcon fontSize="small" /> },
      { label: t('move_down'), action: 'move_down', icon: <ArrowDownwardIcon fontSize="small" /> },
      { label: t('delete'), action: 'delete', icon: <DeleteIcon fontSize="small" />},
    ];
    if (settings.loadBalance?.enable) {
      items.push(
        ... (serverMode === 'single' || !serverMode || clusterId !== item.id)
        ? [{ label: t('enable_load_balance'), action: 'start_cluster', icon: <ViewComfy fontSize="small" />}]
        : [{ label: t('disable_load_balance'), action: 'stop_cluster', icon: <ViewComfy fontSize="small" />}]
      )
    }
    return items;
  }, [serverMode, clusterId]);
  const enqueueSnackbar = (message: SnackbarMessage, options: Notification) => {
    dispatch(enqueueSnackbarAction(message, options))
  };

  useLayoutEffect(() => {
    if (settings.serverMode === 'cluster') {
      handleChange(false);
    }
  }, [settings.serverMode]);

  const handleRemoveButtonClick = () => {
    props.onRemove?.(item.id);
  };

  function onContextMenuClick (action: string) {
    switch (action) {
      case 'copy':
        clipboard.writeText(JSON.stringify(item));
        break;
      case 'update_subscription':
        if (item.url) {
          dispatch(updateSubscription(item.id, item.url, {
            success: t('subscription_updated'),
            error: { default: t('failed_to_update_subscription') }
          }));
        } else {
          enqueueSnackbar(t('server_url_not_set'), { variant: 'warning' });
        }
        break;
      case 'top':
        dispatch(top(item.id));
        break;
      case 'move_up':
        dispatch(moveUp(item.id));
        break;
      case 'move_down':
        dispatch(moveDown(item.id));
        break;
      case 'delete':
        handleRemoveButtonClick();
        break;
      case 'start_cluster':
        dispatch(startClusterAction(config, item.id, settings, {
          success: t('successfully_enabled_load_balance'),
          error: { default: t('failed_to_enable_load_balance') }
        }));
        break;
      case 'stop_cluster':
        dispatch(stopClusterAction());
        break;
      default:
        break;
    }
  }

  const onContextMenu = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    context.show(e, menuContents, onContextMenuClick);
  };

  return (
    <div
    >
      <Accordion expanded={expanded} onChange={() => handleChange(!expanded)}>
        <StyledAccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel1bh-content"
          onContextMenu={onContextMenu}
        >
          <If
            condition={clusterId === item.id && settings.loadBalance?.enable}
            then={
              <If
                condition={serverMode === 'cluster'}
                then={
                  <StyledBadge
                    badgeContent={<>LB</>}
                  >{item.name}
                  </StyledBadge>
                }
                else={
                  <StyledBadgeInactive
                    badgeContent={<>LB</>}
                  >{item.name}
                  </StyledBadgeInactive>
                }
              />
            }
            else={
              <>{item.name}</>
            }
          />
        </StyledAccordionSummary>
        <StyledAccordionDetails>
          {
            item.servers.map(server => (
              <ServerListItemSingle
                selected={selectedServer === server.id}
                moveable={false}
                deleteable={false}
                topable={false}
                key={server.id}
                {...props}
                item={server}
              />
            ))
          }
        </StyledAccordionDetails>
      </Accordion>
    </div>
  );
};

export default memo(ServerListItemGroup);
