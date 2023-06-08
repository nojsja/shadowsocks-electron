import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import {
  useNotifier,
  useEventStreamService,
  useTerminalService,
} from './hooks';

import HomePage from './pages/HomePage';
import SettingsPage from './pages/SettingsPage';
import AboutPage from './pages/AboutPage';
import WorkflowPage from './pages/WorkflowPage';
import AIPage from './pages/AIPage';

const Router = () => {
  useNotifier();
  useEventStreamService();
  useTerminalService();

  return (
    <Switch>
      <Route path="/home">
        <HomePage />
      </Route>
      <Route path="/settings">
        <SettingsPage />
      </Route>
      <Route path="/about">
        <AboutPage />
      </Route>
      <Route path="/workflow">
        <WorkflowPage />
      </Route>
      <Route path="/ai">
        <AIPage />
      </Route>
      <Redirect to="/home" />
    </Switch>
  );
};

export default Router;
