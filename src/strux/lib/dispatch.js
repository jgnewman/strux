/*

Allows syntax such as:

```
Home
  .dispatches('MY_ACTION')
  .when('componentDidMount')
  .as(state => state);
```

*/


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
  as(transformer) {
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
 * Locates the proper dispatch functions to fire for a given
 * class and method name, and fires them.
 *
 * @param  {String} event          Such as 'componentDidMount'.
 * @param  {Object} incomingAction Allows us to get and set the incoming Redux action.
 * @param  {Object} store          A redux store.
 * @param  {Object} instance       An instance of an XComponent extended class.
 *
 * @return {undefined}
 */
function runDispatches(event, incomingAction, store, instance) {

  /*
   * Make sure we have an array of actions to loop over.
   */
  let actions = dispatches[event];
  if (actions) {
    actions = actions[instance.constructor.name];
  }

  /*
   * Each object in the array will take the form {type: type, transformer: Fn}.
   * We'll call the function with the state of the class instance.
   *
   * Next we reset the incoming action so subscribers will know what triggered
   * them within redux.
   *
   * Lastly, we fire a true redux dispatch. NOTE: this assumes the transformer
   * will return a plain object.
   */
  actions && actions.forEach(item => {
    const action = item.transformer(instance.state);
    incomingAction.set(item.type);
    store.dispatch(Object.assign({...action, type: item.type}));
  });
}

export { Dispatch, runDispatches};
