/*

CONCEPT:
Describe redux communications across your app all in one place. This will
eliminate the need to hunt down dispatches and subscriptions.

EXAMPLE:

```
import Home from './home';
import { createStore } from 'strux';

const store = createStore(function reducer() { ... });

Home
  .dispatches('MY_ACTION')
  .when('componentDidMount')
  .as(state => state);

Other
  .picksUp('MY_ACTION')
  .then((appState, other) => {
    other.setState(appState);
  });

Home
  .fetches('/api/v2/users/:id')
  .when('componentDidMount', state => { return {id: 1} })
  .thenDispatches('MY_ACTION')
  .as(data => data);

```

*/

/*
 * Import the necessary items from React and Redux.
 */
import React, { Component as ReactComponent } from 'react';
import { createStore as storeCreator } from 'redux';
import { Dispatch, runDispatches } from './lib/dispatch';
import { Pickup, createSubscribers } from './lib/pickup';
import { Fetch, runFetches } from './lib/fetch';

/*
 * Track a reference to the store created by the user.
 */
let store = null;

/*
 * A symbol allowing us to hide Redux store subscriptions from the user.
 */
const UNSUBSCRIBE = Symbol.for('STRUX_UNSUBSCRIBE');

/*
 * Every time a dispatch occurs, we'll reset this variable first so that
 * when subscribers fire, they'll be able to know which action type
 * triggered the handler.
 */
const incomingAction = new class {
  constructor() {
    this.action = null;
  }
  get() {
    return this.action;
  }
  set(val) {
    this.action = val;
  }
};

/*
 * We'll need to generate methods for each of these lifeCycle method names.
 */
const lifeCycle = [
  'componentDidMount',
  'componentWillUnmount',
  'componentWillMount',
  'componentWillReceiveProps',
  'shouldComponentUpdate',
  'componentWillUpdate',
  'componentDidUpdate'
];

/**
 * @class
 *
 * Adds a layer to React's Component class for smoother Redux
 * work.
 */
class Component extends ReactComponent {

  /**
   * @constructor
   *
   * Runs the super constructor, sets up an place for us to
   * store subscriptions, and makes sure implicit methods exist for this
   * instance. We have to create those methods in the constructor because
   * they are not methods on the Component prototype.
   *
   * @param  {Arguments} ...args Any arguments passed to the constructor.
   *
   * @return {undefined}
   */
  constructor(...args) {
    super(...args);
    this[UNSUBSCRIBE] = null;

    /*
     * Make sure we have an existing method for each life cycle method name.
     * We'll begin by getting a reference to the original method if the user
     * has already attached one.
     */
    lifeCycle.forEach(methodName => {
      const orig = this[methodName];

      /*
       * For each method we create, we'll grab the result of calling the
       * original method if there was one.
       *
       * If this is componentDidMount, we'll create all implicit redux
       * subscribers automatically.
       *
       * Next we run any dispatches that are supposed to occur when this
       * method is called.
       *
       * If this is componentWillUnmount, we unsubscribe our implicit
       * subscribers.
       *
       * Finally we return the result of the original method.
       */
      this[methodName] = (...args) => {
        let out = orig ? orig.call(this, ...args) : undefined;
        methodName === 'shouldComponentUpdate' && !out && (out = false);
        methodName === 'componentDidMount' && createSubscribers(incomingAction, store, this);
        runDispatches(methodName, incomingAction, store, this);
        runFetches(methodName, incomingAction, store, this);
        methodName === 'componentWillUnmount'
          && typeof this[UNSUBSCRIBE] === 'function'
          && this[UNSUBSCRIBE]();
        return out;
      };
    });
  }

  /**
   * A new static method that allows us to begin describing circumstances that
   * will cause instances of this component to trigger Redux dispatches.
   *
   * @param  {String} actionType A redux action type name.
   *
   * @return {Dispatch} Contains more methods for completing the description.
   */
  static dispatches(actionType) {
    return new Dispatch(actionType, this.name);
  }

  /**
   * A new static method that allows us to begin describing that instances
   * of this component will subscribe to certain Redux action types.
   *
   * @param  {String} actionType A redux action type name.
   *
   * @return {Pickup} Contains more methods for completing the description.
   */
  static picksUp(actionType) {
    return new Pickup(actionType, this.name);
  }

  /**
   * A new static method that allows us to begin describing circumstances that
   * will cause a data fetch within the application.
   *
   * @param  {String} url    The datapoint.
   * @param  {Object} config An object modifying the call made _a la_ the fetch api.
   *
   * @return {Pickup} Contains more methods for completing the description.
   */
  static fetches(url, config) {
    return new Fetch(url, config, this.name);
  }

}


/**
 * Override Redux's createStore with a version that allows us to keep
 * track of the store the user creates.
 *
 * @param  {Arguments} ...args Usually a reducer function.
 *
 * @return A Redux store.
 */
function createStore(...args) {
  store = storeCreator(...args);
  return store;
}

/*
 * Users will be able to use this module INSTEAD of Redux as it passes
 * through all the necessary top level pieces as well as our new component type.
 */
export { combineReducers, applyMiddleware, bindActionCreators, compose } from 'redux';
export { createStore, Component };
