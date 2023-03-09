import If from '@renderer/components/HOC/IF';
import { IconButton, Link, SwipeableDrawer } from '@material-ui/core';
import { CloseOutlined } from '@material-ui/icons';
import { shell } from 'electron';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useStylesOfAbout as useStyles } from '../styles';

type Timeline = {
  title: string;
  children: React.ReactNode[];
};

const LinkButton: React.FC<{ href: string; children: React.ReactNode }> = ({
  href,
  children,
}) => {
  const handleClick = () => {
    shell.openExternal(href);
  };

  return (
    <Link component="button" variant="body2" onClick={handleClick}>
      {children}
    </Link>
  );
};

const timeline: Timeline[] = [
  {
    title: 'v1.2.4',
    children: [
      <div key="1">
        <span>
          Feat: Support workflow - organize and execute your nodejs scripts with
          powerful
        </span>
        <LinkButton href="https://github.com/puppeteer/puppeteer">
          {'\u00A0'}puppeteer{'\u00A0'}
        </LinkButton>
        /
        <LinkButton href="https://github.com/bda-research/node-crawler">
          {'\u00A0'}crawler{'\u00A0'}
        </LinkButton>
        tools.
      </div>,
      'Feat: Support OpenAI in workflow terminal, now you can ask AI about how to write puppeteer/crawler scripts for web scraping.',
      'Refactor: Event stream service.',
    ],
  },
  {
    title: 'v1.2.3',
    children: [
      'Feat: Move to new form component - react-hook-form.',
      'Feat: Support Input state indicator on content editing page, such as settings page and server-conf page.',
      'Feat: Support ACL rules editor.',
      'Feat: Support global PAC rules editor.',
      'Feat: Add new encryption method - rc4.',
      'Fix: Error of server status synchronization, it occurs when window closed.',
      'Fix: Bugs of PAC conf regenerating.',
      'Chore: Upgrade electron-re to v1.2.7.',
      'Chore: Upgrade sentry to v4.2.0.',
      'Chore: Upgrade electron-updater to v5.3.0.',
    ],
  },
  {
    title: 'v1.2.2',
    children: [
      'Feat: Support plugin custimization.',
      'Feat: SS/SSR link protocol on Windows/Mac has supported, visit link like ss://[xxxxx] to wake up client on your browser.',
      'Feat: Add embeded v2ray-plugin.',
      'Feat: Support for MacOS Monterey(arm64/x64).',
      'Feat: Support for Russian language(@nanCreate).',
      'Feat: Improved plugin installation instructions and quick enter plugins directory.',
      'Feat: Small UI improvements.',
      'Fix: Server reconnection bugs.',
      'Fix: Bugs of SIP003 plugin parameters and SSR obfs parameters.',
      'Fix: Fatal error when using Global/PAC mode on NO-Gnome Linux desktops, wait for future release to total support.',
      'Chore: Add icon assets of retina screen.',
    ],
  },
  {
    title: 'v1.2.1',
    children: [
      'Feat: Quick connect/disconnect selected server from tray menu.',
      'Feat: Support User PAC rules editor.',
      'Feat: Small UI improvements, such as font color, icons, space.',
      'Fix: PAC mode bugs on Windows.',
      'Fix: Bugs when restore settings from local backup file.',
    ],
  },
  {
    title: 'v1.2.0',
    children: [
      'Refactor: Core modules of Shadowsocks-Electron main process.',
      'Feat: Load-balancing mode for server groups has supported - connect to multiple ssr/ss nodes at the same time.',
      'Feat: Support Network traffic metrics.',
      'Feat: Support Release notes display.',
      'Feat: Acl mode has supported, check instructions in github README.',
      'Feat: Small UI changes and user friendly adjustments.',
      'Feat: When regenerate PAC file, GFWList data downloader will detect proxy server automatically.',
      'Perf: Context menu perfomance improvement.',
      'Perf: Reduce useless server reconnection.',
      'Fix: Pac/Global mode bugs of IPv6 server.',
    ],
  },
  {
    title: 'v1.1.1',
    children: [
      'Feat: Support auto theme mode - dark/light mode, it depends on your system.',
      'Feat: Support auto hide mode - client starts without window popup.',
      'Feat: Support subscription regeneration.',
      'Feat: Import new notification component.',
      'Perf: Theme switching performance improvement.',
      'Fix: Get wrong parsed conf info when re importing a server item sharing link from subscription group.',
      'Fix: Restore config from file but UI do not refresh.',
      'Fix: Long text display of server items info.',
      'Fix: Server group header height.',
    ],
  },
  {
    title: 'v1.1.10',
    children: [
      'Feat: Import new web-based context menu.',
      'Feat: Support for Ubuntu22.04.',
      'Feat: Server items dragging and sorting.',
      'Feat: Small UI changes.',
      'Chore: Upgrade electron to v18.0.3.',
    ],
  },
  {
    title: 'v1.1.9',
    children: [
      'Feat: Import sentry monitor tool for error catching and reporting.',
      'Feat: Support PAC file regeneration.',
      'Feat: Add plugins tips on ss-server configaration page.',
      'Feat: New improved loading effect and some other UI adjustments.',
      'Perf: Improvements of app startup hooks.',
      'Chore: Upgrade process-manager tool to v1.2.0.',
      'Fix: DarkMode bugs when recover setting from local backup file.',
      'Docs: plugins installation instruction in readme.',
    ],
  },
  {
    title: 'v1.1.8',
    children: [
      'Feat: Support for MAC OS catalina (x64) system.',
      'Feat: Add client bootstrap hooks based on tapable.',
      'Feat: Add new title bar for Mac OS.',
    ],
  },
  {
    title: 'v1.1.7',
    children: [
      'Feat: Support fixed menu.',
      'Feat: Support multi language of tray menu.',
      'Feat: Support SSR/SS subscription links import.',
      'Feat: Support server list sorting.',
      'Feat: Support Window resizing.',
      'Perf: Improvements of dark/light mode.',
      'Perf: Improvements of server connecting actions.',
      'Fix: Bugs of dark theme.',
    ],
  },
  {
    title: 'v1.1.6',
    children: [
      'Feat: Add tips when failed to scan QR code from screen.',
      'Feat: UI widgets style adjustments.',
      'Feat: Import electron-updater.',
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
      'Fix: Bugs.',
    ],
  },
  {
    title: 'v1.1.3',
    children: [
      'Feat: Support dark mode.',
      'Feat: Some UI widgets style changes.',
      'Fix: Bugs.',
    ],
  },
];

// eslint-disable-next-line react/prop-types
const ReleaseNodes = React.memo(function ReleaseNodes() {
  const { t } = useTranslation();
  const styles = useStyles();
  const [visible, setVisible] = useState(false);

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
          <div className={styles.releaseDrawerButton} onClick={handleOpen}>
            <span>{t('release_notes')}</span>
          </div>
        }
      />
      <SwipeableDrawer
        anchor={'bottom'}
        open={visible}
        className={styles.releaseDrawerWrapper}
        onClose={handleClose}
        onOpen={handleOpen}>
        {timeline.map((item) => (
          <ol key={item.title}>
            <p>
              <b>{item.title}</b>
            </p>
            {item.children.map((child, i) => (
              <li key={`${item.title}${i}`}>{child}</li>
            ))}
          </ol>
        ))}
        <span className={styles.releaseDrawerClose}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setVisible(false)}>
            <CloseOutlined />
          </IconButton>
        </span>
      </SwipeableDrawer>
    </>
  );
});

export default ReleaseNodes;
