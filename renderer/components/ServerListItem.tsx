import React, { memo } from "react";
import {
  ListItemProps,
  Divider,
} from "@material-ui/core";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import { red } from '@material-ui/core/colors';
// import { useDispatch } from "react-redux";
import { Config, GroupConfig } from "../types";
import ServerListItemGroup from "./ServerListItemGroup";
import ServerListItemSingle from "./ServerListItemSingle";

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

export interface ServerListItemProps extends ListItemProps {
  isLast?: boolean;
  conf: string;
  connected: boolean;
  selectedServer: string | undefined | null;
  item: GroupConfig | Config
  onEdit?: (key: string) => void;
  onShare?: (key: string) => void;
  onRemove?: (key: string) => void;
  handleServerConnect: (key: string) => void;
  handleServerSelect: (key: string) => void;
}

const ServerListItem: React.FC<ServerListItemProps> = props => {
  const styles = useStyles();
  // const dispatch = useDispatch();

  const {
    item,
    selectedServer,
    isLast
  } = props;

  return (
    <div>
    {
      item.type === 'group' ?
        <ServerListItemGroup {...props} item={(props.item as GroupConfig)} selectedServer={selectedServer} /> :
        <ServerListItemSingle {...props} item={(props.item as Config)} selected={selectedServer === item.id} />
    }
    {!isLast && <Divider className={styles.gradientDivider} />}
    </div>
  );
};

export default memo(ServerListItem);
