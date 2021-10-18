import React, { useState } from "react";
import { MessageChannel } from 'electron-re';
import {
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  ListItemProps,
  ListItemIcon,
  Badge,
  Divider
} from "@material-ui/core";
import { makeStyles, createStyles, Theme, withStyles } from "@material-ui/core/styles";
import { grey, red } from '@material-ui/core/colors';
import EditIcon from "@material-ui/icons/Edit";
import CheckBoxOutlinedIcon from '@material-ui/icons/CheckBoxOutlined';
import CheckBoxOutlineBlankOutlinedIcon from '@material-ui/icons/CheckBoxOutlineBlankOutlined';
import ShareIcon from "@material-ui/icons/Share";
import RemoveIcon from "@material-ui/icons/Delete";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    action: {
      "& > *": {
        marginLeft: theme.spacing(1)
      }
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
      color: grey[500],
      backgroundColor: 'white',
      fontWeight: 'bold',
      border: 'solid 1px ' + grey[400]
      // backgroundColor: grey[400]
    },
  }),
)(Badge);

export interface ServerListItemProps extends ListItemProps {
  isLast?: boolean;
  remark?: string;
  serverType?: string;
  ip: string;
  id: string;
  port: number;
  plugin?: string;
  onChoose: (key: string) => void;
  onEdit?: (key: string) => void;
  onShare?: (key: string) => void;
  onRemove?: (key: string) => void;
}

const ServerListItem: React.FC<ServerListItemProps> = props => {
  const styles = useStyles();

  const {
    remark,
    ip,
    id,
    port,
    plugin,
    selected,
    onChoose,
    onEdit,
    onShare,
    onRemove,
    serverType,
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
    onChoose?.(id);
  }

  const onContextMenu = (e: React.MouseEvent<HTMLElement>) => {
    // alert('码云笔记')
    e.preventDefault();
    MessageChannel.invoke('main', 'service:desktop', {
      action: 'contextMenu',
      params: [
        {
          label: "连接",
          action: 'connect',
          accelerator: '',
        },
        {
          label: "复制",
          action: 'copy',
          accelerator: '',
        },
        {
          label: "测试延迟",
          action: 'test',
          accelerator: '',
        }
      ]
    })
    .then(rsp => {
      console.log(rsp);
    });
  };

  return (
    <div onMouseEnter={handleActionShow} onMouseLeave={handleActionHide}>
      <ListItem button onClick={handleChooseButtonClick} onContextMenu={onContextMenu}>
        <ListItemIcon
          className={styles.listIcon}
        >
          {
            selected ? (
              <CheckBoxOutlinedIcon />
            ) :
            <CheckBoxOutlineBlankOutlinedIcon />
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
          <IconButton edge="end" onClick={handleShareButtonClick} size="small">
            <ShareIcon />
          </IconButton>
          <IconButton edge="end" onClick={handleEditButtonClick} size="small">
            <EditIcon />
          </IconButton>
          <IconButton edge="end" onClick={handleRemoveButtonClick} size="small" className={styles.deleteButton}>
            <RemoveIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
      {!isLast && <Divider />}
    </div>
  );
};

export default ServerListItem;
