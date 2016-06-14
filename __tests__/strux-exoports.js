jest.unmock('../dev/components/home');

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import Home from '../dev/components/home';
import { createStore, implicitStore, mapStateToState, Component } from '../dev/strux/strux';


describe('Strux Exports', () => {

  it('should export `createStore`, `implicitStore`, `mapStateToState`, and `Component`', () => {
    expect(typeof createStore).toEqual('function');
    expect(typeof implicitStore).toEqual('object');
    expect(typeof mapStateToState).toEqual('function');
    expect(typeof createStore).toEqual('function');
  });

});
