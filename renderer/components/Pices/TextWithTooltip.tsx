import React from "react";
import {
  createStyles,
  makeStyles,
  Tooltip,
  Theme
} from "@material-ui/core";
import { HelpOutline } from '@material-ui/icons';

export type TextWithTooltipProps = {
  text: string | React.ReactElement,
  tooltip?: string | React.ReactElement,
  icon?: React.ReactElement,
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
    },
    symbol: {
      marginLeft: '4px',
      marginBottom: '2px',
      cursor: 'pointer'
    }
  })
);

export function TextWithTooltip(props: TextWithTooltipProps) {
  const {
    text,
    tooltip,
    icon
  } = props;
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <span>{text}</span>
      {
        tooltip ? (
          <Tooltip arrow placement="top" title={<span>{tooltip}</span>}>
            { icon ? icon : <span className={styles.symbol}>⍰</span> }
          </Tooltip>
        ) : (
          icon || <HelpOutline fontSize="small" />
        )
      }
    </div>
  );
};
