import React, { useState } from "react";
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
  port: number;
  plugin?: string;
  onEdit?: () => void;
  onShare?: () => void;
  onRemove?: () => void;
}

const ServerListItem: React.FC<ServerListItemProps> = props => {
  const styles = useStyles();

  const {
    remark,
    ip,
    port,
    plugin,
    selected,
    onClick,
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
    onEdit?.();
  };

  const handleShareButtonClick = () => {
    onShare?.();
  };

  const handleRemoveButtonClick = () => {
    onRemove?.();
  };

  return (
    <div onMouseEnter={handleActionShow} onMouseLeave={handleActionHide}>
      <ListItem button onClick={onClick as any}>
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
