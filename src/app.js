import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRedirect, browserHistory } from 'react-router';
import $ from 'jquery';
//import state from './state/state';
import store from './state/strux-state';
import Layout from './layout/layout';
import Home from './components/home';
import Other from './components/other';

ReactDOM.render(
  <Router history={browserHistory}>
    <Route path="/" component={Layout}>
      <IndexRedirect to="home" />
      <Route path="home" component={Home} />
      <Route path="other" component={Other} />
    </Route>
  </Router>,
  $('#app')[0]
);
