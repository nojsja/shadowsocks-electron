import React, { useState, memo } from "react";
import { MessageChannel } from 'electron-re';
import { useTranslation } from "react-i18next";
import { clipboard } from "electron";
import {
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  ListItemProps,
  ListItemIcon,
  Badge,
  Divider,
  Tooltip
} from "@material-ui/core";
import { makeStyles, createStyles, Theme, withStyles } from "@material-ui/core/styles";
import { red } from '@material-ui/core/colors';
import EditIcon from "@material-ui/icons/Edit";
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import ShareIcon from "@material-ui/icons/Share";
import RemoveIcon from "@material-ui/icons/Delete";
import { useDispatch } from "react-redux";
import { getConnectionDelay } from "../redux/actions/status";

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

const StyledBadge = withStyles((theme: Theme) =>
  createStyles({
    badge: {
      right: -20,
      top: 12,
      borderRadius: 3,
      padding: '0 5',
      border: `solid 1px #8f8f8f`,
      backgroundColor: 'inherit',
      color: '#8f8f8f'
      // fontWeight: 'bold',
      // border: 'solid 1px ' + grey[400]
      // backgroundColor: grey[400]
    },
  }),
)(Badge);

export interface ServerListItemProps extends ListItemProps {
  isLast?: boolean;
  remark?: string;
  serverType?: string;
  conf: string;
  ip: string;
  id: string;
  port: number;
  plugin?: string;
  connected: boolean;
  onEdit?: (key: string) => void;
  onShare?: (key: string) => void;
  onRemove?: (key: string) => void;
  handleServerConnect: (key: string) => void;
  handleServerSelect: (key: string) => void;
}

const ServerListItem: React.FC<ServerListItemProps> = props => {
  const styles = useStyles();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const {
    remark,
    ip,
    id,
    port,
    plugin,
    selected,
    connected,
    onEdit,
    onShare,
    onRemove,
    conf,
    serverType,
    handleServerConnect,
    handleServerSelect,
    isLast
  } = props;

  const origin = `${ip}:${port}`;

  const [actionHidden, setActionHidden] = useState(true);

  const handleActionHide = () => {
    setActionHidden(true);
  };

  const handleActionShow = () => {
    setActionHidden(false);
  };

  const handleEditButtonClick = () => {
    onEdit?.(id);
  };

  const handleShareButtonClick = () => {
    onShare?.(id);
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

  const onContextMenu = (e: React.MouseEvent<HTMLElement>) => {
    // alert('码云笔记')
    e.preventDefault();
    MessageChannel.invoke('main', 'service:desktop', {
      action: 'contextMenu',
      params: [
        {
          label: (connected && selected) ? t('disconnect') : t('connect'),
          action: (connected && selected) ? ('disconnect') : ('connect'),
          accelerator: '',
        },
        {
          label: t('copy'),
          action: 'copy',
          accelerator: '',
        },
        {
          label: t('delay_test'),
          action: 'test',
          accelerator: '',
        }
      ]
    })
    .then(rsp => {
      if (rsp.code === 200) {
        switch (rsp.result) {
          case 'connect':
            handleChooseButtonClick();
            break;
          case 'disconnect':
            handleChooseButtonClick();
            break;
          case 'copy':
            clipboard.writeText(conf);
            break;
          case 'test':
            dispatch(getConnectionDelay(ip, port));
            break;
          default:
            break;
        }
      }
    });
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
          {
            selected ? (
              <CheckBoxIcon className={styles.lighterPrimary} />
            ) :
              <CheckBoxOutlineBlankIcon />
          }
          </ListItemIcon>

            <ListItemText
              primary={
                <StyledBadge
                  badgeContent={serverType} color="primary"
                >
                  <span>{remark ? remark : origin}</span>
                </StyledBadge>
              }
              secondary={
                remark && plugin
                  ? `${origin} / ${plugin}`
                  : remark
                  ? origin
                  : plugin
                  ? plugin
                  : ""
              }
            />
        <ListItemSecondaryAction
          className={styles.action}
          hidden={actionHidden}
        >
          <Tooltip title={t('share')}>
            <IconButton edge="end" onClick={handleShareButtonClick} size="small">
              <ShareIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('edit')}>
            <IconButton edge="end" onClick={handleEditButtonClick} size="small">
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('delete')}>
            <IconButton edge="end" onClick={handleRemoveButtonClick} size="small" className={styles.deleteButton}>
              <RemoveIcon />
            </IconButton>
          </Tooltip>
        </ListItemSecondaryAction>
      </ListItem>
      {!isLast && <Divider className={styles.gradientDivider} />}
    </div>
  );
};

export default memo(ServerListItem);
