import React from "react";
import {
  Divider,
} from "@material-ui/core";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    gradientDivider: {
      width: '50%',
      margin: 'auto',
      backgroundColor: 'transparent',
      height: '2px',
      backgroundImage: 'linear-gradient(to right, transparent, rgba(0, 0, 0, 0.12), transparent)'
    }
  })
);

const GradientDivider = () => {
  const styles = useStyles();

  return (
    <Divider className={styles.gradientDivider} />
  );
};

export default GradientDivider;
