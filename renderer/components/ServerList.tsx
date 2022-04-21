import React from "react";
import {
  ListItemProps,
  List,
  Typography
} from "@material-ui/core";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";

import ServerListItem from "./ServerListItem";
import { Config, GroupConfig } from "../types/";
import { scrollBarStyle } from "../pages/styles";
import { useDispatch } from "react-redux";
import { moveConfig } from "../redux/actions/config";

export let cloneElement: HTMLDivElement | null;
export const setCloneElement = (div: HTMLDivElement | null) => cloneElement = div;

const useStyles = makeStyles((theme: Theme) =>

  createStyles({
    list: {
      width: "100%",
      flex: 1,
      overflowY: "auto",
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
      borderBottom: `solid 1px ${theme.palette.secondary.main}`
    },
    scrollbar: scrollBarStyle(6, 0, theme),
    empty: {
      flex: 1,
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    },
  })
);

export interface ServerListProps extends ListItemProps {
  config: (Config | GroupConfig)[]
  selectedServer: string | undefined | null,
  connected: boolean;
  onEdit?: (key: string) => void;
  onShare?: (key: string) => void;
  onRemove?: (key: string) => void;
  handleServerConnect: (key: string) => void;
  handleServerSelect: (key: string) => void;
  handleShareButtonClick: (key: string) => void;
  handleEditButtonClick: (key: string) => void;
  handleRemoveButtonClick: (key: string) => void;
}

const ServerList: React.FC<ServerListProps> = props => {

  const dispatch = useDispatch();
  const styles = useStyles();
  const dragTarget = React.useRef<string | null>(null);
  const dragSource = React.useRef<string | null>(null);

  const setDragTarget = (id: string | null) => {
    dragTarget.current = id;
  };

  const setDragSource = (id: string | null) => {
    dragSource.current = id;
  };

  const dragSort = () => {
    if (
      dragTarget.current === dragSource.current ||
      !dragSource.current||
      !dragTarget.current
    ) return;
    dispatch(moveConfig(dragSource.current, dragTarget.current));
    setDragSource(null);
    setDragTarget(null);
  }

  const {
    config,
    connected,
    selectedServer,
    handleShareButtonClick,
    handleEditButtonClick,
    handleRemoveButtonClick,
    handleServerSelect,
    handleServerConnect
  } = props;

  return (
    !!config.length ? (
      <List className={`${styles.list} ${styles.scrollbar}`}>
        {config.map((item, index) => (
          <ServerListItem
            key={item.id}
            item={item}
            dragTarget={dragTarget}
            dragSort={dragSort}
            dragSource={dragSource}
            setDragSource={setDragSource}
            setDragTarget={setDragTarget}
            selectedServer={selectedServer}
            connected={connected}
            onShare={handleShareButtonClick}
            onEdit={handleEditButtonClick}
            onRemove={handleRemoveButtonClick}
            handleServerSelect={handleServerSelect}
            handleServerConnect={handleServerConnect}
            isLast={index === config.length - 1}
          />
        ))}
      </List>
    )
    : (
    <div className={styles.empty}>
      <Typography variant="body1" color="textSecondary">
        No Server
      </Typography>
    </div>
  )
  )

};

export default React.memo(ServerList);
