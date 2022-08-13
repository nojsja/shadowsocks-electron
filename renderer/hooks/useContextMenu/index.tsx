import React, { useState, useRef } from 'react';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { withStyles, createStyles } from '@material-ui/styles';
import { ListItemIcon, Typography } from '@material-ui/core';

import MenuContext from './context';

const initialState: { mouseX: null | number; mouseY: null | number; } = {
  mouseX: null,
  mouseY: null,
};

export interface MenuContent {
  label: string | React.ElementType | JSX.Element,
  action: string,
  icon?: string | React.ElementType | JSX.Element,
}

const StyledMenuItem = withStyles((theme) => createStyles({
  root: {
    minHeight: 'auto',
  }
}))(MenuItem);

const ContextMenu: React.FC<{ children: React.ReactNode }> = (props) => {
  const [state, setState] = useState<{
    mouseX: null | number;
    mouseY: null | number;
  }>(initialState);
  const [items, setItems] = useState<MenuContent[]>([]);
  const callbackRef = useRef<any>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, items: MenuContent[], callback?: (action: string) => void) => {
    event.preventDefault();
    callbackRef.current = callback;
    setState({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
    });
    setItems(items);
  };

  const handleMenuClose = () => {
    setState(initialState);
  }

  const handleMenuClick = (action: string) => {
    handleMenuClose();
    callbackRef?.current(action)
  };

  const anchorPosition =
    state.mouseY !== null && state.mouseX !== null
      ? { top: state.mouseY, left: state.mouseX }
      : undefined;

  return (
    <MenuContext.Provider value={{ show: handleMenuOpen, items }}>
      {
        props.children
      }
      <Menu
        keepMounted
        open={state.mouseY !== null}
        onClose={handleMenuClose}
        anchorReference="anchorPosition"
        anchorPosition={anchorPosition}
      >
        {
          items.map(content => (
            <StyledMenuItem
              key={content.action}
              onClick={() => handleMenuClick(content.action)}
            >
              <ListItemIcon>
                {(content as any).icon}
              </ListItemIcon>
              <Typography variant="inherit">{(content as any).label}</Typography>
            </StyledMenuItem>
          ))
        }
      </Menu>
    </MenuContext.Provider>
  )
}

export default ContextMenu;
