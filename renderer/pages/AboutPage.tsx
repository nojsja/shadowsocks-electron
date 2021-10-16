import React from "react";
import { Container, Typography } from "@material-ui/core";

import packageJson from "../../package.json";
import authorPic from '../../assets/icons/256x256.png';
import { useStylesOfAbout as useStyles } from "./styles";

const AboutPage: React.FC = () => {
  const styles = useStyles();

  return (
    <Container className={styles.container}>
      <div className={styles['author-info__wrapper']}>
        <img src={authorPic} className={styles['author-info__image']}></img>
      </div>
      <Typography className={styles['text-center']} variant="h6" gutterBottom>
        Shadowsocks Electron {packageJson.version}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Shadowsocks GUI application with cross-platform desktop support, see more info in &nbsp;
        <Typography
            variant="body2"
            component="a"
            href="https://github.com/nojsja/shadowsocks-electron"
            target="_blank"
            rel="noopener noreferrer"
            gutterBottom
            color="primary"
          >
            github
          </Typography>.
      </Typography>
      <p className={styles['author-info__others']}>
        <div>
            <Typography variant="caption" gutterBottom>
              Arch: {process.platform} ({process.arch})
            </Typography>
          </div>
        <div>
          <Typography variant="caption" gutterBottom>
            Electron: 13.4.0
          </Typography>
        </div>
        <div>
          <Typography variant="caption" gutterBottom>
            MaterialUI: 4.9.8
          </Typography>
        </div>
        <div>
            <Typography variant="caption" gutterBottom>
              © 2021 nojsja
            </Typography>
          </div>
      </p>
    </Container>
  );
};

export default AboutPage;
