/*

Allows syntax such as:

```
import { implicitStore as store } from 'strux'

store.reduce('MY_ACTION', (curState, action) => {
  return Object.assign({}, curState, {prop: action.prop});
});

store.reduce('ANOTHER_ACTION', (curState, action) => {
  return Object.assign({}, curState, {prop: action.prop});
});
```

This way the user never has to manually create a store.
*/

/*
 * Pull in `createStore` from redux.
 */
import { createStore } from 'redux';

/*
 * Create a place to hold all reduce procedures the user gives us.
 */
const registeredReducers = [];

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
function implicitReducer(state = {}, action) {
  let output;
  let reducerRan = false;
  registeredReducers.some(reducerObject => {
    if (reducerObject.action === action.type) {
      output = reducerObject.procedure(Object.assign({}, state), action);
      return (reducerRan = true);
    }
  });
  if (!reducerRan) {
    return defaultReducer(Object.assign({}, state), action);
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
      registeredReducers.push(new ReducerObject(action, procedure));
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
}

/*
 * Create an `ImplicitStore` object to export.
 */
const implicitStore = new ImplicitStore();

/*
 * Export the object.
 */
export { implicitStore, reduxStore };
