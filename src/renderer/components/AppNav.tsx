import React from 'react';
import os from 'os';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import AppNavMac from './Pices/AppNavMac';
import AppNavNormal from './Pices/AppNavNormal';
import If from './HOC/IF';

const isMacOS = os.platform() === 'darwin';

const AppNav: React.FC = () => {
  const { t } = useTranslation();

  const titleMap = new Map([
    ['home', t('home')],
    ['settings', t('settings')],
    ['about', t('about')],
    ['workflow', t('workflow')]
  ]);

  const location = useLocation();
  const path = location.pathname.split("/")[1];
  const title = titleMap.get(path) || '';

  return (
    <If
      condition={isMacOS}
      then={
        <AppNavMac title={title}/>
      }
      else={
        <AppNavNormal title={title} />
      }
    />
  );
};

export default AppNav;
