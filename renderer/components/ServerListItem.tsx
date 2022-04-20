import React, { DragEvent, memo, useRef } from "react";
import {
  ListItemProps,
  Theme
} from "@material-ui/core";
import { makeStyles, createStyles, useTheme } from "@material-ui/styles";
import { Config, GroupConfig } from "../types";
import ServerListItemGroup from "./ServerListItemGroup";
import ServerListItemSingle from "./ServerListItemSingle";
import GradientDivider from "./Pices/GradientDivider";
import clsx from "clsx";
import { cloneElement, setCloneElement } from "./ServerList";

const img = new Image();
img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII= ';

export interface ServerListItemProps extends ListItemProps {
  isLast?: boolean;
  connected: boolean;
  selectedServer: string | undefined | null;
  item: GroupConfig | Config
  dragTarget: React.MutableRefObject<string | null>;
  dragSource: React.MutableRefObject<string | null>;
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
  wrapper: {
    transition: "all 0.3s linear",
  },
  highlight: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  }
}));

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
  const ref = useRef<HTMLDivElement>(null);
  const theme: Theme = useTheme();

  const onDragStart = (e: DragEvent<HTMLDivElement>) => {
    setCloneElement((e.target as HTMLDivElement).cloneNode(true) as HTMLDivElement);
    (e.target as HTMLDivElement).style.opacity = "0.2";
    setDragSource(item.id);
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const onDragEnd = (e: DragEvent<HTMLDivElement>) => {
    (e.target as HTMLDivElement).style.opacity = "1";
    dragSort();
    if (cloneElement) {
      cloneElement.remove();
    }
  }

  const onDragEnter = () => {
    setDragTarget(item.id);
    if (cloneElement) {
      cloneElement.remove();
      cloneElement.style.transition = 'all 0.3s linear';
      cloneElement.style.border = `dashed 2px ${theme.palette.primary.main}`;
      ref.current?.prepend(cloneElement);
    }
  };

  const isInOver = dragTarget.current === item.id;

  return (
    <>
      <div
        ref={ref}
        draggable={true}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragEnter={onDragEnter}
        className={clsx(styles.wrapper, isInOver && styles.highlight)}
      >
      {
        item.type === 'group' ?
          <ServerListItemGroup {...props} item={(props.item as GroupConfig)} selectedServer={selectedServer} /> :
          <ServerListItemSingle {...props} item={(props.item as Config)} selected={selectedServer === item.id} />
      }
      </div>
      {!isLast && <GradientDivider />}
    </>
  );
};

export default memo(ServerListItem);
