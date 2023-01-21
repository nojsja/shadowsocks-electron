import React from "react";
import {
  Switch,
  Route,
  Redirect
} from 'react-router-dom';

import useNotifier from './hooks/useNotifier';

import HomePage from './pages/HomePage';
import SettingsPage from './pages/SettingsPage';
import AboutPage from './pages/AboutPage';
import UserScript from './pages/UserScript';

const Router = () => {
  useNotifier();
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
      <Route path="/user-script">
        <UserScript />
      </Route>
      <Redirect to="/home" />
    </Switch>
  );
}

export default Router;