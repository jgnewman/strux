jest.unmock('../dev/components/home');

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import Home from '../dev/components/home';
import Other from '../dev/components/home';
import Navigation from '../dev/layout/navigation';
import { implicitStore, mapStateToState } from '../dev/strux/strux';



describe('Strux Component Shape', () => {

  it('should contain the static methods `dispatches`, `picksUp`, and `fetches`', () => {
    expect(Home.dispatches).toBeDefined();
    expect(Home.picksUp).toBeDefined();
    expect(Home.fetches).toBeDefined();
  });

});

describe('Dispatch Object Chain', () => {

  implicitStore.setInitialState({
    home: {},
    other: {},
    navigation: {}
  });

  mapStateToState({
    home: Home,
    other: Other,
    navigation: Navigation
  });

  it('should have set up state correctly', () => {
    expect(implicitStore.getState()).toEqual({
      home: {},
      other: {},
      navigation: {}
    });
  });

});
