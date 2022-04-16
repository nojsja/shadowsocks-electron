import React, { useState, memo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { clipboard } from "electron";
import {
  Accordion,
  AccordionDetails,
  ListItemProps,
  AccordionSummary,
} from "@material-ui/core";
import {
  ExpandMore,
  FileCopy as CopyIcon,
  VerticalAlignTop as VerticalAlignTopIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Delete as DeleteIcon,
} from '@material-ui/icons';
import { createStyles, Theme, withStyles } from "@material-ui/core/styles";
import { useDispatch } from "react-redux";
import { moveDown, moveUp, top } from "../redux/actions/config";
import ServerListItemSingle from "./ServerListItemSingle";
import { GroupConfig } from "../types";
import useContextMenu from "../hooks/useContextMenu";

const StyledAccordionDetails = withStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      paddingLeft: 0,
      paddingRight: 0,
      margin: 'auto',
      backgroundColor: theme.palette.type === "dark" ? '#383838' : '#fdfdfd',
    }
  }),
)(AccordionDetails);

const StyledAccordionSummary = withStyles((theme: Theme) => (
  createStyles({
    root: {
      minHeight: '36px',
      backgroundColor: theme.palette.type === "dark" ? '#525252' : 'rgba(255, 255, 255, 1)',
      '&.Mui-expanded': {
        minHeight: '56px',
      },
      '& .MuiAccordionSummary-content': {
        margin: '8px 0'
      },
      '& .MuiIconButton-root': {
        padding: '8px 12px',
      },
    }
  })
))(AccordionSummary);


export interface ServerListItemGroupProps extends ListItemProps {
  isLast?: boolean;
  connected: boolean;
  item: GroupConfig;
  selectedServer: string | null | undefined;
  onEdit?: (key: string) => void;
  onShare?: (key: string) => void;
  onRemove?: (key: string) => void;
  handleServerConnect: (key: string) => void;
  handleServerSelect: (key: string) => void;
}

const ServerListItemGroup: React.FC<ServerListItemGroupProps> = props => {
  // const styles = useStyles();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const {
    item,
    selectedServer
  } = props;

  const [expanded, handleChange] = useState(!!item.servers?.find(server => server.id === selectedServer));
  const [ContextMenu, handleMenuOpen] = useContextMenu([
    { label: t('copy'), action: 'copy', icon: <CopyIcon/> },
    { label: t('top'), action: 'top', icon: <VerticalAlignTopIcon />},
    { label: t('move_up'), action: 'move_up', icon: <ArrowUpwardIcon /> },
    { label: t('move_down'), action: 'move_down', icon: <ArrowDownwardIcon /> },
    { label: t('delete'), action: 'delete', icon: <DeleteIcon />}
  ]);

  useEffect(() => {
    handleChange(!!item.servers?.find(server => server.id === selectedServer));
  }, [selectedServer]);

  const handleRemoveButtonClick = () => {
    props.onRemove?.(item.id);
  };

  function onContextMenuClick (action: string) {
    switch (action) {
      case 'copy':
        clipboard.writeText(JSON.stringify(item));
        break;
      case 'top':
        dispatch(top(item.id));
        break;
      case 'move_up':
        dispatch(moveUp(item.id));
        break;
      case 'move_down':
        dispatch(moveDown(item.id));
        break;
      case 'delete':
        handleRemoveButtonClick();
      default:
        break;
    }
  }

  const onContextMenu = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleMenuOpen(e);
  };

  return (
    <div
    >
      <Accordion expanded={expanded} onChange={() => handleChange(!expanded)}>
        <StyledAccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel1bh-content"
          onContextMenu={onContextMenu}
        >
          { item.name }
        </StyledAccordionSummary>
        <StyledAccordionDetails>
          {
            item.servers.map(server => (
              <ServerListItemSingle
                selected={selectedServer === server.id}
                moveable={false}
                deleteable={false}
                topable={false}
                key={server.id}
                {...props}
                item={server}
              />
            ))
          }
        </StyledAccordionDetails>
      </Accordion>
      <ContextMenu onItemClick={onContextMenuClick} />
    </div>
  );
};

export default memo(ServerListItemGroup);
