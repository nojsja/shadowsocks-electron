import React, { FC, forwardRef, useState } from 'react';
import { IconButton, Input, InputAdornment, type InputProps } from '@material-ui/core';
import { Visibility, VisibilityOff } from '@material-ui/icons';

const InputPassword: FC<InputProps> = forwardRef((props, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(v => !v);
  };

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  return (
    <Input
      {...props}
      ref={ref}
      type={showPassword ? "text" : "password"}
      endAdornment={
        <InputAdornment position="end">
          <IconButton
            onClick={handleClickShowPassword}
            onMouseDown={handleMouseDownPassword}
          >
            {showPassword ? <Visibility /> : <VisibilityOff />}
          </IconButton>
        </InputAdornment>
      }
    />
  );
});

InputPassword.displayName = "InputPassword";

export default InputPassword;
