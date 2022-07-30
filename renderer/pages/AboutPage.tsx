import React, { useCallback, useState } from "react";
import { Container, Typography, SwipeableDrawer, IconButton } from "@material-ui/core";
import { CloseOutlined } from "@material-ui/icons";
import os from "os";

import packageJson from "../../package.json";
import authorPic from '../../assets/icons/256x256.png';
import { useStylesOfAbout as useStyles } from "./styles";
import If from "../components/HOC/IF";
import { useTranslation } from "react-i18next";

const timeline = [
  {
    title: 'v1.2.1',
    children: [
      'Feat: Quick connect/disconnect selected server from tray menu.',
      'Feat: User PAC rules editor supported.',
      'Fix: PAC mode bugs on windows.',
      'Fix: Bugs when restore settings from local backup file.',
      'Style: UI adjustments for font color, icons, space.',
    ]
  },
  {
    title: 'v1.2.0',
    children: [
      'Refactor: Core module of Shadowsocks-Electron main process.',
      'Feat: Server groups load-balancing mode supported - connect to multiple ssr/ss nodes at the same time.',
      'Feat: Network traffic metrics supported.',
      'Feat: Release notes display supported.',
      'Feat: Acl mode supported, check instructions in github README.',
      'Feat: When regenerate PAC file, GFWList data download processor will detect proxy server automatically.',
      'Perf: Context menu perfomance improvement.',
      'Perf: Reduce useless server reconnection.',
      'Update: Small ui change and user friendly adjustment.',
      'Fix: Pac/Global mode bugs of IPv6 server.',
      'Style: Text color adjustment of status bar.',
    ]
  },
  {
    title: 'v1.1.1',
    children: [
      'Feat: Auto Theme mode in settings supported - dark/light mode, it depends on your system.',
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
      'Style: header bar and other small ui change.'
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
      'Feat: fixed menu supported.',
      'Feat: multi language support for tray menu.',
      'Feat: ssr/ss subscription links import supported.',
      'Feat: server sort supported.',
      'Feat: window resize supported.',
      'Update: dark/light mode.',
      'Update: server connecting actions.',
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
      'Feat: Using frameless window.',
      'Update: Light & Dark Mode adjustment.',
    ],
  },
  {
    title: 'v1.1.4',
    children: [
      'Feat: Windows platform supported.',
      'Style: UI change.',
      'Fix: Bugs fixed.'
    ],
  },
  {
    title: 'v1.1.3',
    children: [
      'Feat: Dark Mode supported.',
      'Style: Some UI widget style change.',
      'Fix: Bugs fixed.'
    ],
  },
];

const ReleaseNodes: React.FC<{ timeline: typeof timeline }> = React.memo(({ timeline }) => {
  const [visible, setVisible] = useState(false);
  const styles = useStyles();
  const { t } = useTranslation();

  const handleClose = useCallback(() => {
    setVisible(false);
  }, []);

  const handleOpen = useCallback(() => {
    setVisible(true);
  }, []);

  return (
    <>
      <If
        condition={!visible}
        then={
          <div
            className={styles['release-drawer__button']}
            onClick={handleOpen}
          >
            <span>{ t('release_notes') }</span>
          </div>
        }
      />
      <SwipeableDrawer
        anchor={'bottom'}
        open={visible}
        className={styles['release-drawer__wrapper']}
        onClose={handleClose}
        onOpen={handleOpen}
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
        <span
          className={styles['release-drawer__close']}
        >
          <IconButton edge="start" color="inherit" onClick={() => setVisible(false)}>
              <CloseOutlined />
          </IconButton>
        </span>
      </SwipeableDrawer>
    </>
  );
});

const AboutPage: React.FC = () => {
  const styles = useStyles();

  return (
    <Container className={styles.container}>
      <div className={styles['author-info__wrapper']}>
        <img src={authorPic} alt="author" className={styles['author-info__image']}></img>
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
      <ReleaseNodes timeline={timeline} />
    </Container>
  );
};

export default AboutPage;
