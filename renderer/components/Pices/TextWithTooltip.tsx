import React from "react";
import {
  createStyles,
  makeStyles,
  Tooltip,
  Theme
} from "@material-ui/core";
import { HelpOutline } from '@material-ui/icons';
import NotListedLocationIcon from '@material-ui/icons/NotListedLocation';

export type TextWithTooltipProps = {
  text: string | React.ReactElement;
  tooltip?: string | React.ReactElement;
  icon?: React.ReactElement;
  iconAlign?: 'top' | 'bottom' | 'center';
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "inline-flex",
      alignItems: "top",
      justifyContent: "center",
    },
    symbol: {
      marginLeft: '4px',
      marginBottom: '2px',
      cursor: 'pointer'
    },
    questionIcon: {
      paddingTop: '4px',
      color: 'grey'
    }
  })
);

export const TextWithTooltip: React.FC<TextWithTooltipProps> = (props) => {
  const {
    text,
    tooltip,
    icon,
    iconAlign
  } = props;
  const styles = useStyles();

  return (
    <div className={styles.root} style={{ alignItems: iconAlign }}>
      <span>{text}</span>
      {
        tooltip ? (
          <Tooltip arrow placement="top" title={<span>{tooltip}</span>}>
            { icon
              ? icon
              : (
                <span className={styles.symbol}>
                  <NotListedLocationIcon fontSize="small" className={styles.questionIcon} />
                </span>
              )
            }
          </Tooltip>
        ) : (
          icon || <HelpOutline fontSize="small" />
        )
      }
    </div>
  );
};

TextWithTooltip.defaultProps = {
  iconAlign: 'center'
};