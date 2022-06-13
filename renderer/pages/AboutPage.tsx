import React, { useState } from "react";
import { Container, Typography, SwipeableDrawer, Button } from "@material-ui/core";
import os from "os";

import packageJson from "../../package.json";
import authorPic from '../../assets/icons/256x256.png';
import { useStylesOfAbout as useStyles } from "./styles";

const timeline = [
  {
    title: 'v1.1.3',
    children: [
      'Feat: Auto Theme mode in settings supported - dark / light mode, it depends on your system.',
      'Feat: Auto Hide mode in settings supported - auto hide window on startup.',
      'Feat: Subscription regeneration.',
      'Update: Notification element.',
      'Update: Theme switching performance improvement.',
      'Fix: Get wrong parsed conf info when re importing a server item sharing link from subscription group.',
      'Fix: Restore config from file but UI do not refresh.',
      'Style: Long text display of server items info.',
      'Style: Server group header height.'
    ],
  },
  {
    title: 'v1.1.10',
    children: [
      'Feat: new web-based context menu.',
      'Feat: Ubuntu22.04 supported.',
      'Feat: server items dragging and sort.',
      'Update: upgrade electron to v18.0.3.',
      'Style: header bar and other small ui changes.'
    ],
  },
  {
    title: 'v1.1.9',
    children: [
      'Feat: import sentry monitor system for error auto catching and reporting.',
      'Feat: PAC file regeneration supported.',
      'Update: plugins tips on ss-server configaration page.',
      'Update: plugins installation instruction in readme.',
      'Update: upgrade process-manager tool to v1.2.0.',
      'Update: app startup hooks order.',
      'Fix: darkMode bugs when recover setting from local backup file.',
      'Style: server loading effect and other little ui adjustments.',
    ],
  },
  {
    title: 'v1.1.8',
    children: [
      'Feat: mac os catalina (x64) supported.',
      'Feat: electron app bootstrap hooks based on tapable.',
      'Style: mac os title bar.'
    ],
  },
  {
    title: 'v1.1.7',
    children: [
      'Update: dark / light mode.',
      'Update: server connecting actions.',
      'Feat: fixed menu supported.',
      'Feat: multi language support for tray menu.',
      'Feat: ssr / ss subscription links import supported.',
      'Feat: server sort supported.',
      'Feat: window resize supported.',
      'Fix: dark theme bugs.'
    ],
  },
  {
    title: 'v1.1.6',
    children: [
      'Fixed: server manually addition error.',
      'Update: tips will show when scan QR code from screen failed.',
      'Style: ui widgets style changed.',
      'Feat: electron-updater supported.'
    ],
  },
  {
    title: 'v1.1.5',
    children: [
      'Light & Dark Mode adjustment.',
      'Using frameless window.',
    ],
  },
  {
    title: 'v1.1.4',
    children: [
      'Windows platform supported.',
      'UI changes.',
      'Bugs fixed.'
    ],
  },
  {
    title: 'v1.1.3',
    children: [
      'Dark Mode supported.',
      'Some UI widget style changes.',
      'Bugs fixed.'
    ],
  },
];

const Release: React.FC<{ timeline: typeof timeline }> = React.memo(({ timeline }) => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Button onClick={() => setVisible(true)}>Releases</Button>
      <SwipeableDrawer
        anchor={'bottom'}
        open={visible}
        onClose={() => setVisible(false)}
        onOpen={() => setVisible(true)}
      >
      {
          timeline.map(item => (
            <ol key={item.title}>
              <p><b>{item.title}</b></p>
              {
                item.children.map((child, i) => (
                  <li key={`${item.title}${i}`}>{child}</li>
                ))
              }
            </ol>
          ))
        }
      </SwipeableDrawer>
    </>
  );
});

const AboutPage: React.FC = () => {
  const styles = useStyles();

  return (
    <Container className={styles.container}>
      <div className={styles['author-info__wrapper']}>
        <img src={authorPic} className={styles['author-info__image']}></img>
      </div>
      <div className={styles['text-center']}>
        <Typography className={styles['text-center']} variant="h6" gutterBottom>
          Shadowsocks Electron {packageJson.version}
        </Typography>
        <Typography variant="body1" gutterBottom>
          Shadowsocks GUI application with cross-platform desktop support, get more info on &nbsp;
          <Typography
              variant="body2"
              component="a"
              href="https://github.com/nojsja/shadowsocks-electron"
              target="_blank"
              rel="noopener noreferrer"
              gutterBottom
              className={styles['link-color__light']}
              color="primary"
            >
              github
            </Typography>.
        </Typography>
        <div className={styles['author-info__others']}>
          <div>
              <Typography variant="caption" gutterBottom>
                OS: {os.platform()} ({os.arch()})
              </Typography>
            </div>
          <div>
            <Typography variant="caption" gutterBottom>
              Electron: { packageJson.devDependencies['electron'] }
            </Typography>
          </div>
          <div>
            <Typography variant="caption" gutterBottom>
              MaterialUI: { packageJson.devDependencies['@material-ui/core'] }
            </Typography>
          </div>
          <div>
              <Typography variant="caption" gutterBottom>
                © 2021 nojsja
              </Typography>
            </div>
        </div>
      </div>
      <Release timeline={timeline} />
    </Container>
  );
};

export default AboutPage;
