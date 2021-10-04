import React from "react";
import { makeStyles, createStyles } from "@material-ui/core/styles";
// import { ReactComponent as LogoSrc } from "../../assets/logo.svg";
import LogoSrc from "../../assets/logo.svg";

const useStyles = makeStyles(theme =>
  createStyles({
    logo: {
      '& > svg': {
        marginTop: 8,
        width: 30,
        height: 30,
        filter:
          "invert(100%) sepia(100%) saturate(0%) hue-rotate(151deg) brightness(120%) contrast(101%)"
      }
    }
  })
);

interface LogoProps {
  className: string
}

const Logo: React.FC<LogoProps> = (props) => {
  const styles = useStyles();
  return (
    <span className={`${styles.logo} ${props.className}`}>
      <LogoSrc />
    </span>
  );
};

export default Logo;
