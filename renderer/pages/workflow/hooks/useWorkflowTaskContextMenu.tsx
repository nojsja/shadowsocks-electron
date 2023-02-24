import React, { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { blue, green, orange } from '@material-ui/core/colors';

import MenuContext from '@renderer/components/ContextMenu/context';
import { ArrowDownward as ArrowDownwardIcon, ArrowUpward as ArrowUpwardIcon } from '@material-ui/icons';

const COLOR_MAP = {
  'source': green[600],
  'pipe': orange[600],
  'other': blue[600],
};

interface Props {
  index: number;
  total: number;
  taskSymbol: keyof typeof COLOR_MAP;
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
  ], [t, index]);

  const show = (e: React.MouseEvent<HTMLElement>, callback?: (key: string) => void) => {
    context.show(e, menus, (action) => {
      e.preventDefault();
      e.stopPropagation();
      switch (action) {
        case 'move_up':
          break;
        case 'move_down':
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
