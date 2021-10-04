import React from "react";
import { Container, Typography } from "@material-ui/core";

import packageJson from "../../package.json";
import { useStylesOfAbout as useStyles } from "./styles";

const AboutPage: React.FC = () => {
  const styles = useStyles();

  return (
    <Container className={styles.container}>
      <Typography variant="h6" gutterBottom>
        Shadowsocks Electron {packageJson.version}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Shadowsocks GUI with cross-platform desktop support
      </Typography>
      <Typography
        variant="body2"
        component="a"
        href="https://github.com/nojsja/shadowsocks-electron"
        target="_blank"
        rel="noopener noreferrer"
        gutterBottom
        color="primary"
      >
        nojsja/shadowsocks-electron
      </Typography>
      <Typography variant="caption" gutterBottom>
        © 2020 nojsja
      </Typography>
    </Container>
  );
};

export default AboutPage;
