/*

Allows syntax such as:

```
MyComponent
  .picksUp('MY_ACTION')
  .then((appState, other) => {
    other.setState(appState);
  });
```

*/


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
const UNSUBSCRIBE = Symbol.for('STRUX_UNSUBSCRIBE');

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
 * Creates implicit subscriptions to Redux actions for a rendered component.
 *
 * @param  {Object} incomingAction Allows us to get and set the incoming Redux action.
 * @param  {Object} store          A redux store.
 * @param  {Object} instance An instance of an XComponent extended class.
 *
 * @return {undefined}
 */
function createSubscribers(incomingAction, store, instance) {
  instance[UNSUBSCRIBE] = store.subscribe(() => {
    let relevantPickups = pickups[instance.constructor.name];
    if (relevantPickups) {
      relevantPickups = relevantPickups[incomingAction.get()];
    }
    if (relevantPickups) {
      const state = store.getState();
      relevantPickups.forEach(handler => handler(state, instance));
    }
  });
}

export { Pickup, createSubscribers };
