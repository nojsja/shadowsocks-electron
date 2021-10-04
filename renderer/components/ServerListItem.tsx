import React, { useState } from "react";
import {
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  ListItemProps,
  ListItemIcon,
  Divider
} from "@material-ui/core";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { red } from '@material-ui/core/colors';
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

export interface ServerListItemProps extends ListItemProps {
  isLast?: boolean;
  remark?: string;
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
          primary={remark ? remark : origin}
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
