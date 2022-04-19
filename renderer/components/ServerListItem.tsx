import React, { memo } from "react";
import {
  ListItemProps,
  Theme
} from "@material-ui/core";
import { makeStyles, createStyles } from "@material-ui/styles";
import { Config, GroupConfig } from "../types";
import ServerListItemGroup from "./ServerListItemGroup";
import ServerListItemSingle from "./ServerListItemSingle";
import GradientDivider from "./Pices/GradientDivider";
import clsx from "clsx";

export interface ServerListItemProps extends ListItemProps {
  isLast?: boolean;
  connected: boolean;
  selectedServer: string | undefined | null;
  item: GroupConfig | Config
  dragTarget: string | null;
  dragSource: string | null;
  onEdit?: (key: string) => void;
  onShare?: (key: string) => void;
  onRemove?: (key: string) => void;
  handleServerConnect: (key: string) => void;
  handleServerSelect: (key: string) => void;
  setDragTarget: (id: string | null) => void;
  setDragSource: (id: string | null) => void;
  dragSort: () => void;
}

const useStyles = makeStyles((theme: Theme) => createStyles({
  highlight: {
    borderTop: `solid 2px ${theme.palette.primary.main}`,
  }
}))

const ServerListItem: React.FC<ServerListItemProps> = props => {
  const {
    item,
    selectedServer,
    isLast,
    dragTarget,
    dragSort,
    setDragTarget,
    setDragSource
  } = props;

  const styles = useStyles();

  const onDragStart = () => {
    setDragSource(item.id);
  };

  const onDragEnd = () => {
    dragSort();
  }

  const onDragEnter = () => {
    setDragTarget(item.id);
  };

  return (
    <div
      draggable={true}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragEnter={onDragEnter}
      className={clsx(dragTarget === item.id && styles.highlight)}
    >
    {
      item.type === 'group' ?
        <ServerListItemGroup {...props} item={(props.item as GroupConfig)} selectedServer={selectedServer} /> :
        <ServerListItemSingle {...props} item={(props.item as Config)} selected={selectedServer === item.id} />
    }
    {!isLast && <GradientDivider />}
    </div>
  );
};

export default memo(ServerListItem);
