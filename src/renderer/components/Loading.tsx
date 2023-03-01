import React from "react";
import { CircularProgress } from "@material-ui/core";
import { makeStyles, createStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }
  })
);

const Loading: React.FC = () => {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <CircularProgress />
    </div>
  );
};

export default Loading;
