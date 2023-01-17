import React, { useCallback, useState } from "react";
import { Container, Typography, SwipeableDrawer, IconButton } from "@material-ui/core";
import { CloseOutlined } from "@material-ui/icons";
import os from "os";
import { useTranslation } from "react-i18next";

import packageJson from "../../package.json";
import authorPic from '../../assets/icons/256x256.png';
import { useStylesOfAbout as useStyles } from "./styles";
import If from "../components/HOC/IF";

type Timeline = {
  title: string;
  children: string[];
}[];

const timeline = [
  {
    title: 'v1.2.3',
    children: [
      'Feat: Use the new form component - react-hook-form.',
      'Feat: Add input status indicator on content editing page such as settings/server-conf page.',
      'Feat: Add new encryption method - rc4.',
      'Fix: Error when synchronize server status from main process when window destroyed.',
      'Chore: Upgrade electron-re to v1.2.7.',
      'Chore: Upgrade sentry to v4.2.0.',
      'Chore: Upgrade electron-updater to v5.3.0.'
    ]
  },
  {
    title: 'v1.2.2',
    children: [
      'Feat: Support for plugin custimization.',
      'Feat: SS/SSR link protocol on Windows/Mac supported, visit link like ss://[xxxxx] to wake up client on your browser.',
      'Feat: Add embeded v2ray-plugin.',
      'Feat: Support for MacOS Monterey(arm64/x64).',
      'Feat: Support for Russian language(@nanCreate).',
      'Feat: Improved plugin installation instructions and quick enter plugins directory.',
      'Feat: Small UI improvements.',
      'Fix: Server reconnection bugs.',
      'Fix: Bugs of SIP003 plugin parameters and SSR obfs parameters.',
      'Fix: Fatal error when using Global/PAC mode on NO-Gnome Linux desktops, please wait for future release to total support.',
      'Chore: Add icon assets of retina screen.',
    ]
  },
  {
    title: 'v1.2.1',
    children: [
      'Feat: Quick connect/disconnect selected server from tray menu.',
      'Feat: User PAC rules editor supported.',
      'Feat: Small UI improvements, such as font color, icons, space.',
      'Fix: PAC mode bugs on Windows.',
      'Fix: Bugs when restore settings from local backup file.',
    ]
  },
  {
    title: 'v1.2.0',
    children: [
      'Refactor: Core modules of Shadowsocks-Electron main process.',
      'Feat: Server groups load-balancing mode supported - connect to multiple ssr/ss nodes at the same time.',
      'Feat: Network traffic metrics supported.',
      'Feat: Release notes display supported.',
      'Feat: Acl mode supported, check instructions in github README.',
      'Feat: Small UI changes and user friendly adjustments.',
      'Feat: When regenerate PAC file, GFWList data download processor will detect proxy server automatically.',
      'Perf: Context menu perfomance improvement.',
      'Perf: Reduce useless server reconnection.',
      'Fix: Pac/Global mode bugs of IPv6 server.',
    ]
  },
  {
    title: 'v1.1.1',
    children: [
      'Feat: Auto Theme mode in settings supported - dark/light mode, it depends on your system.',
      'Feat: Auto Hide mode in settings supported - auto hide window on startup.',
      'Feat: Subscription regeneration.',
      'Feat: Import new notification component.',
      'Perf: Theme switching performance improvement.',
      'Fix: Get wrong parsed conf info when re importing a server item sharing link from subscription group.',
      'Fix: Restore config from file but UI do not refresh.',
      'Fix: Long text display of server items info.',
      'Fix: Server group header height.'
    ],
  },
  {
    title: 'v1.1.10',
    children: [
      'Feat: Import new web-based context menu.',
      'Feat: Ubuntu22.04 supported.',
      'Feat: Server items dragging and sorting.',
      'Feat: Small UI changes.',
      'Chore: Upgrade electron to v18.0.3.',
    ],
  },
  {
    title: 'v1.1.9',
    children: [
      'Feat: import sentry monitor system for error auto catching and reporting.',
      'Feat: PAC file regeneration supported.',
      'Feat: Add plugins tips on ss-server configaration page.',
      'Feat: Change loading effect and some other UI adjustments.',
      'Perf: Improvements of app startup hooks.',
      'Chore: Upgrade process-manager tool to v1.2.0.',
      'Fix: DarkMode bugs when recover setting from local backup file.',
      'Docs: plugins installation instruction in readme.',
    ],
  },
  {
    title: 'v1.1.8',
    children: [
      'Feat: Platform MAC OS catalina (x64) supported.',
      'Feat: Electron app bootstrap hooks based on tapable.',
      'Feat: Add new title bar for Mac OS.'
    ],
  },
  {
    title: 'v1.1.7',
    children: [
      'Feat: Fixed menu supported.',
      'Feat: Multi language support for tray menu.',
      'Feat: SSR/SS subscription links import supported.',
      'Feat: Server sorting supported.',
      'Feat: Window resizing supported.',
      'Perf: Improvements of dark/light mode.',
      'Perf: Improvements of server connecting actions.',
      'Fix: Bugs of dark theme.'
    ],
  },
  {
    title: 'v1.1.6',
    children: [
      'Feat: Add tips when failed to scan QR code from screen.',
      'Feat: UI widgets style adjustments.',
      'Feat: Support for electron-updater.',
      'Fix: Fatal error on server add.',
    ],
  },
  {
    title: 'v1.1.5',
    children: [
      'Feat: Using frameless window.',
      'Feat: Adjustments of light/dark mode.',
    ],
  },
  {
    title: 'v1.1.4',
    children: [
      'Feat: Support for Windows platform.',
      'Feat: Small UI changes.',
      'Fix: Bugs.'
    ],
  },
  {
    title: 'v1.1.3',
    children: [
      'Feat: Support for dark mode.',
      'Feat: Some UI widgets style changes.',
      'Fix: Bugs.'
    ],
  },
];

// eslint-disable-next-line react/prop-types
const ReleaseNodes = React.memo(function ReleaseNodes({ timeline }: { timeline: Timeline }) {
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
