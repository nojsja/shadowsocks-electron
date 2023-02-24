import React, { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { blue, green, orange } from '@material-ui/core/colors';

import MenuContext from '@renderer/components/ContextMenu/context';
import {
  ArrowDownward as ArrowDownwardIcon,
  ArrowUpward as ArrowUpwardIcon,
  Delete as DeleteIcon,
} from '@material-ui/icons';

const COLOR_MAP = {
  'source': green[600],
  'pipe': orange[600],
  'other': blue[600],
};

interface Props {
  id: string;
  index: number;
  total: number;
  taskSymbol: keyof typeof COLOR_MAP;
  deleteTask: (taskId: string) => void;
  moveUpTask: (taskId: string) => Promise<void>;
  moveDownTask: (taskId: string) => Promise<void>;
}


const useWorkflowTaskContextMenu = (props: Props) => {
  const context = useContext(MenuContext);
  const { t } = useTranslation();
  const { index, total, taskSymbol } = props;

  const menus = useMemo(() => [
    ...(index !== 0) ? [{
      label: <>{t('move_up')}<span style={{ color: COLOR_MAP[taskSymbol] }}> [{taskSymbol}]</span></>,
      action: 'move_up',
      icon: <ArrowUpwardIcon fontSize="small" />
    }] : [],
    ...(index !== total - 1) ? [{ label: <>{t('move_down')}<span style={{ color: COLOR_MAP[taskSymbol] }}> [{taskSymbol}]</span></>,
    action: 'move_down',
    icon: <ArrowDownwardIcon fontSize="small" />
    }] : [],
    {
      label: t('delete'),
      action: 'delete',
      icon: <DeleteIcon fontSize="small" />,
    }
  ], [t, index]);

  const show = (e: React.MouseEvent<HTMLElement>, callback?: (key: string) => void) => {
    context.show(e, menus, (action) => {
      e.preventDefault();
      e.stopPropagation();
      switch (action) {
        case 'move_up':
          props.moveUpTask(props.id);
          break;
        case 'move_down':
          props.moveDownTask(props.id);
          break;
        case 'delete':
          props.deleteTask(props.id);
          break;
        default:
          break;
      }
      callback?.(action);
    });
  };

  return show;
}

export default useWorkflowTaskContextMenu;
