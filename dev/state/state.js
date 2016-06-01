import { createStore } from 'redux';

/*
 * Define a model for the original application state.
 */
const originalState = {

};

/**
 * Create a gateway describing how all actions
 * will create a new state.
 *
 * @param  {Object} state  The current application state.
 * @param  {Object} action Describes a state change.
 *
 * @return {Object} The new application state.
 */
function reducer(state = originalState, action) {
  switch (action.type) {

    // case 'NEW_MESSAGE':
    //   return Object.assign({}, state, {
    //     messages: state.messages.concat([action.message])
    //   });

    /*
     * In the default case, return a copy of the original state.
     */
    default:
      return Object.assign({}, state, {});
  }
}

/*
 * Export the state.
 */
export const state = createStore(reducer);
