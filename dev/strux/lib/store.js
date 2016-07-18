import { createStore } from 'redux';
import * as utils from './utils';

/**
 * A reducer for our redux store.
 *
 * @param  {Object} currentState Defaults to our originalState values.
 * @param  {Object} actionObject Contains data about the state change.
 *
 * @return {Object}              Denotes the new application state.
 */
export default function reducer(currentState = {}, actionObject) {
  switch(actionObject.type) {

    /*
     * When we detect a component state change, we want to make sure its
     * values are reflected in the global state and that this change is
     * tracked as our most recent change.
     */
    case utils.STATE_CHANGE:
      const newState = Object.assign({}, currentState);
      const className = actionObject.className;
      const oldVals = actionObject.oldVals;
      const newVals = actionObject.newVals;
      let   update;

      /*
       * If the current state is not yet tracking values for the class
       * in question, add all the values to the new state and mark them
       * all as updated.
       */
      if (!currentState[className]) {
        newState[className] = newVals;
        update = {};
        utils.eachKey(newVals, (val, key) => update[key] = [oldVals[key], val]);

      /*
       * Otherwise, compare the current state with the new state and
       * collect all the values that have changed.
       */
      } else {
        const subState = newState[className];
        update = {};
        utils.eachKey(newVals, (val, key) => {
          update[key] = [oldVals[key], val];
          subState[key] = val;
        });
      }

      /*
       * Mark which class triggered the most recent change.
       * Also attach the update to that record.
       */
      utils.mostRecentChange.className = className;
      utils.mostRecentChange.update = update;

      /*
       * Update to the new state.
       */
      return newState;

    default:
      return currentState;
  }
}

/*
 * Create a redux store using our reducer.
 */
const store = createStore(reducer);

export default store;
