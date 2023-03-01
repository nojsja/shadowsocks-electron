import React, { useState, memo, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { clipboard } from 'electron';
import {
  ListItem,
  ListItemSecondaryAction,
  IconButton,
  ListItemProps,
  ListItemIcon,
  Badge,
  Tooltip
} from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { makeStyles, createStyles, Theme, withStyles } from '@material-ui/core/styles';
import { red } from '@material-ui/core/colors';

import {
  Delete as RemoveIcon,
  Share as ShareIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  CheckBox as CheckBoxIcon,
  Edit as EditIcon,
  FileCopy as CopyIcon,
  SettingsEthernet as SettingsEthernetIcon,
  VerticalAlignTop as VerticalAlignTopIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
} from '@material-ui/icons';

import { getConnectionDelay } from '@renderer/redux/actions/status';
import { moveDown, moveUp, top } from '@renderer/redux/actions/config';

import ListItemTextMultipleLine from '@renderer/components/Pices/ListItemTextMultipleLine';
import If from '@renderer/components/HOC/IF';
import MenuContext from '@renderer/components/ContextMenu/context';
import { Config } from '@renderer/types';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    action: {
      "& > *": {
        marginLeft: theme.spacing(1)
      }
    },
    lighterPrimary: {
      color: theme.palette.primary.light
    },
    gradientDivider: {
      width: '50%',
      margin: 'auto',
      backgroundColor: 'transparent',
      height: '2px',
      backgroundImage: 'linear-gradient(to right, transparent, rgba(0, 0, 0, 0.12), transparent)'
    },
    deleteButton: {
      '&:hover': {
        color: red[600]
      }
    },
    listIcon: {
      minWidth: theme.spacing(6)
    }
  })
);

const StyledBadge = withStyles(() =>
  createStyles({
    badge: {
      right: -20,
      top: 12,
      borderRadius: 3,
      padding: '0 5',
      border: `solid 1px #8f8f8f`,
      backgroundColor: 'inherit',
      color: '#8f8f8f'
    },
  }),
)(Badge);

export interface ServerListItemSingleProps extends ListItemProps {
  isLast?: boolean;
  moveable?: boolean;
  deleteable?: boolean;
  topable?: boolean;
  connected: boolean;
  item: Config;
  onEdit?: (key: string) => void;
  onShare?: (key: string) => void;
  onRemove?: (key: string) => void;
  handleServerConnect: (key: string) => void;
  handleServerSelect: (key: string) => void;
}

const ServerListItemSingle: React.FC<ServerListItemSingleProps> = props => {
  const styles = useStyles();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const {
    selected,
    connected,
    onEdit,
    onShare,
    onRemove,
    item,
    topable = true,
    moveable = true,
    deleteable = true,
    handleServerConnect,
    handleServerSelect,
  } = props;

  const {
    id,
    remark,
    type,
    serverHost,
    serverPort,
    plugin,
  } = item;

  const origin = `${serverHost}:${serverPort}`;
  const [actionHidden, setActionHidden] = useState(true);
  const context = useContext(MenuContext);
  const secondaryText =
    (remark && plugin) ?
    `${origin} / ${plugin}` :
    remark ?
    origin :
    plugin ?
    plugin :
    "";

  const menuContents = useMemo(() => {
    return [
      {
        label: (connected && selected) ? t('disconnect') : t('connect'),
        action: (connected && selected) ? ('disconnect') : ('connect'),
        icon: (connected && selected) ? <WifiOffIcon fontSize="small" /> : <WifiIcon fontSize="small" />
      },
      { label: t('copy'), action: 'copy', icon: <CopyIcon fontSize="small" /> },
      { label: t('share'), action: 'share', icon: <ShareIcon fontSize="small" />},
      ...topable ? [
        { label: t('top'), action: 'top', icon: <VerticalAlignTopIcon fontSize="small" />},
      ] : [],
      ...moveable ? [{
        label: t('move_up'), action: 'move_up', icon: <ArrowUpwardIcon fontSize="small" />},
      { label: t('move_down'), action: 'move_down', icon: <ArrowDownwardIcon fontSize="small" /> }] : [],
    ];
  }, [connected, selected, topable, moveable]);

  const handleActionHide = () => {
    setActionHidden(true);
  };

  const handleActionShow = () => {
    setActionHidden(false);
  };

  const handleEditButtonClick = () => {
    onEdit?.(id);
  };

  const handleTestButtonClick = () => {
    dispatch(getConnectionDelay(serverHost, serverPort));
  };

  const handleRemoveButtonClick = () => {
    onRemove?.(id);
  };

  const handleChooseButtonClick = () => {
    if (selected) {
      if (connected) {
        handleServerConnect(id);
      } else {
        handleServerConnect(id);
      }
    } else {
      if (connected) {
        handleServerSelect(id);
      } else {
        handleServerSelect(id);
        setTimeout(() => {
          handleServerConnect(id);
        }, 300);
      }
    }
  }

  const handleContextMenuClick = (action: string) => {
    switch (action) {
      case 'connect':
        handleChooseButtonClick();
        break;
      case 'disconnect':
        handleChooseButtonClick();
        break;
      case 'copy':
        clipboard.writeText(JSON.stringify(item));
        break;
      case 'share':
        onShare?.(id);
        break;
      case 'top':
        dispatch(top(item.id));
        break;
      case 'move_up':
        dispatch(moveUp(id));
        break;
      case 'move_down':
        dispatch(moveDown(id));
        break;
      default:
        break;
    }
  }

  const onContextMenu = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    context.show(e, menuContents, handleContextMenuClick);
  };

  return (
    <div
      onMouseEnter={handleActionShow}
      onMouseLeave={handleActionHide}
    >
      <ListItem button onClick={handleChooseButtonClick} onContextMenu={onContextMenu}>
        <ListItemIcon
          className={styles.listIcon}
        >
          <If
            condition={selected}
            then={<CheckBoxIcon className={styles.lighterPrimary} />}
            else={<CheckBoxOutlineBlankIcon />}
          />
        </ListItemIcon>

        <ListItemTextMultipleLine
          primary={
            <StyledBadge
              badgeContent={type} color="primary"
            >
              <span>{remark ? remark : origin}</span>
            </StyledBadge>
          }
          secondary={
            // <TextEllipsis text={secondaryText as string} />
            secondaryText
          }
        />

        <ListItemSecondaryAction
          className={styles.action}
          hidden={actionHidden}
        >
          <Tooltip title={t<string>('delay_test')}>
            <IconButton edge="end" onClick={handleTestButtonClick} size="small" >
              <SettingsEthernetIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t<string>('edit')}>
            <IconButton edge="end" onClick={handleEditButtonClick} size="small">
              <EditIcon />
            </IconButton>
          </Tooltip>
          <If
            condition={deleteable}
            then={
              <Tooltip title={t<string>('delete')}>
                <IconButton edge="end" onClick={handleRemoveButtonClick} size="small" className={styles.deleteButton}>
                  <RemoveIcon />
                </IconButton>
              </Tooltip>
            }
          />
        </ListItemSecondaryAction>
      </ListItem>
    </div>
  );
};

export default memo(ServerListItemSingle);
