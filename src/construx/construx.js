/*

CONCEPT:
Describe redux communications across your app all in one place. This will
eliminate the need to hunt down dispatches and subscriptions.

EXAMPLE:

```
import Home from './home';
import { createStore } from 'construx';

const store = createStore(function reducer() { ... });

Home
  .dispatches('MY_ACTION')
  .when('componentDidMount')
  .using((result, home) => {
    return home.state;
  });

Other
  .picksUp('MY_ACTION')
  .then((appState, other) => {
    other.setState(appState);
  });

```

TODO: Why can't babel find my super methods?
Only possible explanation: These aren't prototypal methods. React is just saying,
hey, if you happen to have put this function in your own prototype, call it on
these certain events.

*/

/*
 * Import the necessary items from React and Redux.
 */
import React, { Component } from 'react';
import { createStore as storeCreator } from 'redux';

/*
 * Track a reference to the store created by the user.
 */
let store = null;

/*
 * Holds descriptions for all dispatch actions throughout the application.
 * The tree takes the following form:
 *   dispatches = {
 *     componentDidMount: {
 *       ComponentClassName: [ { type: 'MY_ACTION', transformer: FUNCTION } ]
 *     }
 *   }
 */
const dispatches = {};

/*
 * Holds descriptions for all pickup actions throughout the application.
 * The tree takes the following form:
 *   pickups = {
 *     componentClassName: {
 *       'MY_ACTION': [FUNCTION, FUNCTION, FUNCTION]
 *     }
 *   }
 */
const pickups = {};

/*
 * A symbol allowing us to hide Redux store subscriptions from the user.
 */
const UNSUBSCRIBE = Symbol();

/*
 * Every time a dispatch occurs, we'll reset this variable first so that
 * when subscribers fire, they'll be able to know which action type
 * triggered the handler.
 */
let incomingAction = null;

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
 * Builds a level of the pickups tree.
 */
class Pickup {

  /**
   * @constructor
   *
   * Sets up important properties on the instance.
   *
   * @param  {String} actionType    A Redux action type.
   * @param  {String} className    The name of the class that brought us here.
   *
   * @return {undefined}
   */
  constructor(actionType, className) {
    this.actionType = actionType;
    this.className = className;
  }

  /**
   * Associates a handler with an action type in context of a Redux subscription.
   *
   * @param  {Function} handler Called with the new state and a component instance.
   *
   * @return {undefined}
   */
  then(handler) {
    pickups[this.className] = pickups[this.className] || {};
    pickups[this.className][this.actionType] = pickups[this.className][this.actionType] || [];
    pickups[this.className][this.actionType].push(handler);
  }
}

/**
 * @class
 *
 * Builds a level of the dispatches tree.
 */
class ActionBuilder {

  /**
   * @constructor
   *
   * Sets up important properties on the instance.
   *
   * @param  {String} triggerMethod The name of the method triggering a dispatch.
   * @param  {String} actionType    A Redux action type.
   * @param  {String} className    The name of the class that brought us here.
   *
   * @return {undefined}
   */
  constructor(triggerMethod, actionType, className) {
    this.triggerMethod = triggerMethod;
    this.actionType = actionType;
    this.className = className;
  }

  /**
   * Completes the last level of the dispatches tree so that we will have
   * the necessary data to actually fire a Redux dispatch.
   *
   * @param  {Function} transformer Should return an object that will constitute an action.
   *
   * @return {undefined}
   */
  using(transformer) {
    dispatches[this.triggerMethod][this.className].push({
      type: this.actionType,
      transformer: transformer
    });
  }
}

/**
 * @class
 *
 * Builds a level of the dispatches tree.
 */
class Dispatch {

  /**
   * @constructor
   *
   * Sets up important properties on the instance.
   *
   * @param  {String} actionType A Redux action type.
   * @param  {String} className  The name of the class that brought us here.
   *
   * @return {undefined}
   */
  constructor(actionType, className) {
    this.actionType = actionType;
    this.className = className;
  }

  /**
   * Allows the user to specify a component method that will trigger the dispatch.
   *
   * @param  {String} triggerMethod The method name.
   *
   * @return {ActionBuilder} Contains more functionality for completing the description.
   */
  when(triggerMethod) {
    dispatches[triggerMethod] = dispatches[triggerMethod] || {};
    dispatches[triggerMethod][this.className] = dispatches[triggerMethod][this.className] || [];
    return new ActionBuilder(triggerMethod, this.actionType, this.className);
  }
}

/**
 * @class
 *
 * Adds a layer to React's Component class for smoother Redux
 * work.
 */
class XComponent extends Component {

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
        let out = orig ? orig(...args) : undefined;
        methodName === 'shouldComponentUpdate' && !out && (out = false);
        methodName === 'componentDidMount' && createSubscribers(this);
        runDispatches(methodName, out, this);
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
   * @return {Pickup} Contains more methods for completing the description.
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

}

/**
 * Locates the proper dispatch functions to fire for a given
 * class and method name, and fires them.
 *
 * @param  {String} event       Such as 'componentDidMount'.
 * @param  {Any}    superResult The result of calling the event's super method.
 * @param  {Object} instance    An instance of an XComponent extended class.
 *
 * @return {undefined}
 */
function runDispatches(event, superResult, instance) {

  /*
   * Make sure we have an array of actions to loop over.
   */
  let actions = dispatches[event];
  if (actions) {
    actions = actions[instance.constructor.name];
  }

  /*
   * Each object in the array will take the form {type: type, transformer: Fn}.
   * We'll call the function with the result of the event method as well as
   * with the class instance itself.
   *
   * Next we reset the incoming action so subscribers will know what triggered
   * them within redux.
   *
   * Lastly, we fire a true redux dispatch. NOTE: this assumes the transformer
   * will return a plain object.
   */
  actions && actions.forEach(item => {
    const action = item.transformer(superResult, instance);
    incomingAction = item.type;
    store.dispatch(Object.assign({...action, type: item.type}));
  });
}

/**
 * Creates implicit subscriptions to Redux actions for a rendered component.
 *
 * @param  {Object} instance An instance of an XComponent extended class.
 *
 * @return {undefined}
 */
function createSubscribers(instance) {
  instance[UNSUBSCRIBE] = store.subscribe(() => {
    let relevantPickups = pickups[instance.constructor.name];
    if (relevantPickups) {
      relevantPickups = relevantPickups[incomingAction];
    }
    if (relevantPickups) {
      const state = store.getState();
      relevantPickups.forEach(handler => handler(state, instance));
    }
  });
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
export { createStore, XComponent };
