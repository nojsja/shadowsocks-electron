import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import {
  useNotifier,
  useEventStreamService,
  useTerminalService,
} from './hooks';

import HomePage from './pages/home';
import SettingsPage from './pages/settings';
import AboutPage from './pages/about';
import WorkflowPage from './pages/workflow';
import AIPage from './pages/ai';

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
