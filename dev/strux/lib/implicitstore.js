/*

Allows syntax such as:

```
import { implicitStore as store } from 'strux'

store.setInitialState({
  property1: 'value1',
  property2: 'value2'
});

store.reduce('MY_ACTION', (curState, action) => {
  return Object.assign({}, curState, { property1: action.prop });
});

store.reduce('ANOTHER_ACTION', (curState, action) => {
  return Object.assign({}, curState, { property2: action.prop });
});
```

This way the user never has to manually create a store.
*/

/*
 * Pull in `createStore` from redux.
 */
import { createStore } from 'redux';

/*
 * Set the initial state as an object.
 * We're going to require that the state always
 * take the form of an object.
 */
let initialState = {};
let initialStateManuallySet = false;

/*
 * A value to be used internally for calling the reducer with the
 * purpose of resetting the application state back to a default.
 */
const reset = Symbol();

/**
 * @class
 *
 * Builds an object that will be placed into the
 * `registeredReducers` array.
 */
class ReducerObject {

  /**
   * @constructor
   *
   * Sets initial properties on the object.
   *
   * @param  {String}   action    The type of redux action associated with this
   *                              reduction procedure.
   * @param  {Function} procedure The procedure to run when this action is
   *                              dispatched through redux.
   *
   * @return {undefined}
   */
  constructor(action, procedure) {
    this.action = action;
    this.procedure = procedure;
  }
}

/*
 * Create a place to hold all reduce procedures the user gives us.
 */
const registeredReducers = {
  [reset]: new ReducerObject(reset, () => initialState)
};

/*
 * Create a defaultReducer to run when the action doesn't match any
 * provided actions. It will simply return the state.
 */
let defaultReducer = function (state, action) {
  return state;
};

/**
 * The implicitReducer will be the only reducer passed to redux's
 * `createStore` function. It will loop over each of the procedures
 * in the `registeredReducers` array and call the one whose associated
 * action matches the action dispatched through redux. It will return
 * the result of calling that procedure.
 *
 * @param  {Object} state  The application state. Assumed to be an object.
 * @param  {Object} action The action object handed to us by redux.
 *
 * @return {Object} The new form of the application state.
 */
function implicitReducer(state = initialState, action) {
  let output;

  /*
   * Find a reducer in `registeredReducers` matching our incoming action type.
   */
  if (Object.prototype.hasOwnProperty.call(registeredReducers, action.type)) {

    /*
     * Run the reducer procedure with a copy of the current state and the
     * incoming action. Set its result to be the output value.
     */
    const procedure = registeredReducers[action.type].procedure;
    output = procedure(Object.assign({}, state), action);

  /*
   * If action.type does not match a registered reducer, run the
   * default reducer instead.
   */
  } else {
    output = defaultReducer(Object.assign({}, state), action);
  }

  /*
   * Do a sanity check to make sure the intended form of the new state
   * is still an object. If so, return it.
   */
  if (typeof output !==  'object') {
    throw new Error(`Your application state must always take the form of an object accepting keys and values when using the implicit store.`);
  }
  return output;
}

/*
 * Create a redux store.
 */
const reduxStore = createStore(implicitReducer);

/**
 * @class
 *
 * Builds an object that allows the user to add reducers to the
 * `registeredReducers` array.
 */
class ImplicitStore {

  /**
   * Allows the user to associate a procedure with a redux action
   * such that, when the action is dispatched, only the provided
   * function will run.
   *
   * @param  {String}   action    Optional. The type of redux action associated
   *                              with this reduction procedure. If this
   *                              argument is not supplied, the provided
   *                              reducer will become the `defaultReducer`,
   *                              which will run when the dispatched action
   *                              doesn't match any registered reducers.
   * @param  {Function} procedure The procedure to run when this action is
   *                              dispatched through redux.
   *
   * @return {ImplicitStore} This object.
   */
  reduce(action, procedure) {
    if (arguments.length === 1 && typeof action === 'function') {
      defaultReducer = procedure;
    } else {
      registeredReducers[action] = new ReducerObject(action, procedure);
    }
    return this;
  }

  /**
   * Allow the user to retrieve the redux store.
   *
   * @return The redux store.
   */
  getStore() {
    return reduxStore;
  }

  /**
   * Allow the user to retrieve a copy of the current state.
   *
   * @return The current application state.
   */
  getState() {
    return Object.assign({}, reduxStore.getState());
  }

  /**
   * Allow the user a single opportunity to set the initial application state.
   *
   * @param {Object} stateObject Any type of object accepting keys and values.
   *
   * @return {Object} A copy of the current state.
   */
  setInitialState(stateObject) {
    if (typeof stateObject !==  'object') {
      throw new Error(`Initial state must take the form of an object that accepts keys and values.`);
    } else if (initialStateManuallySet) {
      throw new Error(`You can not set the initial state more than once.`);
    } else {
      initialStateManuallySet = true;
      initialState = stateObject;
      reduxStore.dispatch({ type: reset });
      return this.getState();
    }
  }
}

/*
 * Create an `ImplicitStore` object to export.
 */
const implicitStore = new ImplicitStore();

/*
 * Export the object.
 */
export { implicitStore, reduxStore };
