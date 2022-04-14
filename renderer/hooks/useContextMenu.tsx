import React from 'react';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { withStyles, createStyles } from '@material-ui/styles';
import { makeStyles } from '@material-ui/core';

const initialState = {
  mouseX: null,
  mouseY: null,
};

interface MenuContent {
  label: string | React.ElementType | JSX.Element,
  action: string,
  icon?: string | React.ElementType | JSX.Element,
}

interface ContextMenuProps {
  onItemClick?: (action: string) => void;
  contents?: MenuContent[];
}

const useStyles = makeStyles((theme) => createStyles({
  label: {
    marginLeft: theme.spacing(1),
  }
}));

const StyledMenuItem = withStyles((theme) => createStyles({
  root: {
    minWidth: 150
  }
}))(MenuItem);

export default function ContextMenu(contents: MenuContent[]): [React.ElementType, (event: React.MouseEvent<HTMLElement>) => void, () => void] {
  const styles = useStyles();
  const [state, setState] = React.useState<{
    mouseX: null | number;
    mouseY: null | number;
  }>(initialState);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    setState({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
    });
  };

  const handleMenuClose = () => {
    setState(initialState);
  }

  const handleMenuClick = (action: string, callback?: (action: string) => void) => {
    handleMenuClose();
    callback && callback(action);
  };

  const anchorPosition =
    state.mouseY !== null && state.mouseX !== null
      ? { top: state.mouseY, left: state.mouseX }
      : undefined;

  return [
    React.memo((innerProps: ContextMenuProps) =>
      <Menu
        keepMounted
        open={state.mouseY !== null}
        onClose={handleMenuClose}
        anchorReference="anchorPosition"
        anchorPosition={ anchorPosition }
      >
        {
          (innerProps.contents ?? contents).map(content => (
            <StyledMenuItem
              key={content.action}
              onClick={() => handleMenuClick(content.action, innerProps.onItemClick)}
            >
              { content.icon } {<span className={styles.label}>{content.label}</span>}
            </StyledMenuItem>
          ))
        }
    </Menu>
    ),
    handleMenuOpen,
    handleMenuClose
  ];
}
