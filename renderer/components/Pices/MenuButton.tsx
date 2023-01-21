import React from 'react';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

interface MenuCofig {
  label: string;
  key: string;
  onClick?: () => void;
}

interface IProps {
  config: MenuCofig[];
  onSelect?: (key: string) => void;
  menuButton?: React.ReactNode;
}

const MenuButton: React.FC<IProps> = ({
  config,
  onSelect,
  menuButton,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClick = (key: string, callback?: (key: string) => void) => {
    setAnchorEl(null);
    onSelect?.(key);
    callback?.(key);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      {
        menuButton ? (
          <span onClick={handleOpen}>{menuButton}</span>
        ) : (
          <Button aria-haspopup="true" onClick={handleOpen}>
            Open
          </Button>
        )
      }
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {
          config.map((item) => (
            <MenuItem
              key={item.key}
              onClick={() => handleMenuClick(item.key, item.onClick)}
            >
              {item.label}
            </MenuItem>
          ))
        }
      </Menu>
    </div>
  );
}

export default MenuButton;
