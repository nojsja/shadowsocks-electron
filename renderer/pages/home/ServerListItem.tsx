import React, { DragEvent, memo, useRef } from 'react';
import {
  ListItemProps,
  Theme
} from '@material-ui/core';
import { makeStyles, createStyles, useTheme } from '@material-ui/styles';
import clsx from 'clsx';

import { Config, GroupConfig } from '@renderer/types';

import If from '@renderer/components/HOC/IF';
import GradientDivider from '@renderer/components/Pices/GradientDivider';

import ServerListItemGroup from './ServerListItemGroup';
import ServerListItemSingle from './ServerListItemSingle';

const img = new Image();
img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII= ';

let cloneElement: HTMLDivElement | null;
const setCloneElement = (div: HTMLDivElement | null) => cloneElement = div;

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
    if (cloneElement) {
      (e.target as HTMLDivElement).style.opacity = "1";
      dragSort();
      cloneElement.remove();
      setCloneElement(null);
    }
  }

  const onDragEnter = () => {
    if (cloneElement) {
      setDragTarget(item.id);
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
        <If
          condition={item.type === 'group'}
          then={<ServerListItemGroup {...props} item={(props.item as GroupConfig)} selectedServer={selectedServer} />}
          else={<ServerListItemSingle {...props} item={(props.item as Config)} selected={selectedServer === item.id} />}
        />
      </div>
      <If
        condition={!isLast}
        then={
          <GradientDivider />
        }
      />
    </>
  );
};

export default memo(ServerListItem);
