import React from "react";
import {
  ListItemProps,
  List,
  Typography
} from "@material-ui/core";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";

import ServerListItem from "./ServerListItem";
import { Config } from "../types/";
import { scrollBarStyle } from "../pages/styles";


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
    scrollbar: scrollBarStyle(10, 0),
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
  config: Config[]
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

  const styles = useStyles();

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
            id={item.id || ''}
            remark={item.remark}
            serverType={item.type}
            ip={item.serverHost}
            port={item.serverPort}
            plugin={item.plugin}
            selected={item.id === selectedServer}
            conf={JSON.stringify(item)}
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
