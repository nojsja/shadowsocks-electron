import React, { useState, memo, useEffect } from "react";
import { MessageChannel } from 'electron-re';
import { useTranslation } from "react-i18next";
import { clipboard } from "electron";
import {
  Accordion,
  AccordionDetails,
  ListItemProps,
  AccordionSummary,
} from "@material-ui/core";
import {
  ExpandMore
} from '@material-ui/icons';
import { createStyles, Theme, withStyles } from "@material-ui/core/styles";
import { useDispatch } from "react-redux";
import { moveDown, moveUp, top } from "../redux/actions/config";
import ServerListItemSingle from "./ServerListItemSingle";
import { GroupConfig } from "../types";

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
      backgroundColor: theme.palette.type === "dark" ? '#525252' : 'rgba(255, 255, 255, 1)',
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

  const [actionHidden, setActionHidden] = useState(true);
  const [expanded, handleChange] = useState(!!item.servers?.find(server => server.id === selectedServer));

  useEffect(() => {
    handleChange(!!item.servers?.find(server => server.id === selectedServer));
  }, [selectedServer]);

  console.log(actionHidden);

  const handleActionHide = () => {
    setActionHidden(true);
  };

  const handleActionShow = () => {
    setActionHidden(false);
  };

  const handleRemoveButtonClick = () => {
    props.onRemove?.(item.id);
  };

  const onContextMenu = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    MessageChannel.invoke('main', 'service:desktop', {
      action: 'contextMenu',
      params: [
        {
          label: `📄 ${t('copy')}`,
          action: 'copy',
          accelerator: '',
        },
        {
          label: `🔝 ${t('top')}`,
          action: 'top',
          accelerator: '',
        },
        {
          label: `🔼 ${t('move_up')}`,
          action: 'move_up',
          accelerator: '',
        },
        {
          label: `🔽 ${t('move_down')}`,
          action: 'move_down',
          accelerator: '',
        },
        {
          label: `🗑 ${t('delete')}`,
          action: 'delete',
          accelerator: '',
        },
      ]
    })
    .then(rsp => {
      if (rsp.code === 200) {
        switch (rsp.result) {
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
    });
  };

  return (
    <div
      onMouseEnter={handleActionShow}
      onMouseLeave={handleActionHide}
      onContextMenu={onContextMenu}
    >
      <Accordion expanded={expanded} onChange={() => handleChange(!expanded)}>
        <StyledAccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel1bh-content"
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
    </div>
  );
};

export default memo(ServerListItemGroup);
