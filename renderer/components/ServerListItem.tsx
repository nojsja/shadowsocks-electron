import React, { memo } from "react";
import {
  ListItemProps,
} from "@material-ui/core";
import { Config, GroupConfig } from "../types";
import ServerListItemGroup from "./ServerListItemGroup";
import ServerListItemSingle from "./ServerListItemSingle";
import GradientDivider from "./Pices/GradientDivider";

export interface ServerListItemProps extends ListItemProps {
  isLast?: boolean;
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
    {!isLast && <GradientDivider />}
    </div>
  );
};

export default memo(ServerListItem);
