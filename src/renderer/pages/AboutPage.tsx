import React from 'react';
import { Container, Typography, Tooltip } from '@material-ui/core';
import os from 'os';

import authorPic from '@/assets/icons/256x256.png';
import packageJsonRenderer from '@renderer/package.json';
import packageJsonMain from '@/package.json';

import ReleaseNotes from './about/ReleaseNotes';
import { useStylesOfAbout as useStyles } from './styles';

const AboutPage: React.FC = () => {
  const styles = useStyles();

  return (
    <Container className={styles.contentWrapper}>
      <div className={styles.authorInfoWrapper}>
        <img
          src={authorPic}
          alt="author"
          className={styles.authorInfoImage}></img>
      </div>
      <div className={styles.textCenter}>
        <Typography className={styles.textCenter} variant="h6" gutterBottom>
          Shadowsocks Electron {packageJsonMain.version}
        </Typography>
        <Typography variant="body1" gutterBottom>
          Shadowsocks GUI application with cross-platform desktop support, get
          more info on &nbsp;
          <Typography
            variant="body2"
            component="a"
            href="https://github.com/nojsja/shadowsocks-electron"
            target="_blank"
            rel="noopener noreferrer"
            gutterBottom
            className={styles.linkColorLight}
            color="primary">
            github
          </Typography>
          .
        </Typography>
        <div className={styles.authorInfoOthers}>
          <div>
            <Typography variant="caption" gutterBottom>
              OS: {os.platform()} ({os.arch()})
            </Typography>
          </div>
          <div>
            <Typography variant="caption" gutterBottom>
              Electron: {packageJsonMain.devDependencies['electron']}
            </Typography>
          </div>
          <div>
            <Typography variant="caption" gutterBottom>
              Node.js: 16.13.2
            </Typography>
          </div>
          <div>
            <Typography variant="caption" gutterBottom>
              React: {packageJsonRenderer.devDependencies['react']}
            </Typography>
          </div>
          <div>
            <Typography variant="caption" gutterBottom>
              MaterialUI:{' '}
              {packageJsonRenderer.devDependencies['@material-ui/core']}
            </Typography>
          </div>
          <div>
            <Typography variant="caption" gutterBottom>
              <Tooltip
                title={
                  <>
                    <div>
                      <Typography variant="caption" gutterBottom>
                        electron-re:{' '}
                        {packageJsonRenderer.dependencies['electron-re']}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="caption" gutterBottom>
                        sentry:{' '}
                        {packageJsonRenderer.dependencies['@sentry/electron']}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="caption" gutterBottom>
                        tapable: {packageJsonMain.dependencies['tapable']}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="caption" gutterBottom>
                        i18next: {packageJsonRenderer.dependencies['i18next']}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="caption" gutterBottom>
                        electron-store:{' '}
                        {packageJsonMain.dependencies['electron-store']}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="caption" gutterBottom>
                        winston: {packageJsonMain.dependencies['winston']}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="caption" gutterBottom>
                        react-js-cron-mui:{' '}
                        {packageJsonRenderer.dependencies['react-js-cron-mui']}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="caption" gutterBottom>
                        crawler: {packageJsonMain.dependencies['crawler']}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="caption" gutterBottom>
                        puppeteer-core:{' '}
                        {packageJsonMain.dependencies['puppeteer-core']}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="caption" gutterBottom>
                        node-schedule:{' '}
                        {packageJsonMain.dependencies['node-schedule']}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="caption" gutterBottom>
                        qrcode: {packageJsonMain.dependencies['qrcode']}
                      </Typography>
                    </div>
                    <div>
                      <Typography variant="caption" gutterBottom>
                        socks: {packageJsonMain.dependencies['socks']}
                      </Typography>
                    </div>
                  </>
                }
                arrow
                placement="top">
                <span className={styles.cursorPointer}>more...</span>
              </Tooltip>
            </Typography>
          </div>
        </div>
      </div>
      <div className={styles.copyright}>
        <Typography variant="caption" gutterBottom>
          © 2021-{new Date().getFullYear()} nojsja
        </Typography>
      </div>
      <ReleaseNotes />
    </Container>
  );
};

export default AboutPage;
