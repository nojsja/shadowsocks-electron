import React from "react";
import {
  Switch,
  Route,
  Redirect
} from 'react-router-dom';

import { useNotifier, useEventStreamService } from './hooks';

import HomePage from './pages/HomePage';
import SettingsPage from './pages/SettingsPage';
import AboutPage from './pages/AboutPage';
import WorkflowPage from './pages/WorkflowPage';

const Router = () => {
  useNotifier();
  useEventStreamService();

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
      <Redirect to="/home" />
    </Switch>
  );
}

export default Router;