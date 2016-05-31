/*

Allows syntax such as:

```
mapStateToState({
  applicationPropName: Component
});
```

*/

/*
 * Takes the form: {
 *   ComponentClassName: 'appStateProp'
 * }
 */
const mappings = {};

/*
 * A symbol allowing us to hide Redux store subscriptions from the user.
 */
const UNSUBSCRIBERS = Symbol.for('STRUX_UNSUBSCRIBE');

/**
 * A shortcut for checking if an object owns a key.
 *
 * @param  {Object} object The object to search in.
 * @param  {String} key    The key to try to find in the object.
 *
 * @return {Boolean}
 */
function owns(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

/**
 * Collects differences between a piece of the application state and
 * a component state and returns them in the form of an object.
 *
 * @param  {Object} appStateChunk A piece of the application state.
 * @param  {Object} instanceState The state property on a component instance.
 *
 * @return {Object|false}
 */
function isolateUpdates(appStateChunk, instanceState) {
  const output = {};
  let counter = 0;

  /*
   * We'll collect a difference when there is a key on the app state that
   * doesn't exist on the component state or when the value on the app state
   * doesn't match the value on the component state.
   */
  Object.keys(appStateChunk).forEach(key => {
    const val = appStateChunk[key];
    if (!owns(instanceState, key) || val !== instanceState[key]) {
      counter += 1;
      output[key] = val;
    }
  });
  return counter ? output : false;
}

/**
 * Creates implicit subscriptions to Redux actions for updating a
 * component state.
 *
 * @param  {Object} store    A redux store.
 * @param  {Object} instance An instance of an XComponent extended class.
 *
 * @return {undefined}
 */
function createMappingSubscribers(store, instance) {
  instance[UNSUBSCRIBERS].push(store.subscribe(() => {
    const className = instance.constructor.name;
    const relevantStateValue = store.getState()[mappings[className]];
    if (relevantStateValue && typeof relevantStateValue === 'object') {
      const changes = isolateUpdates(relevantStateValue, instance.state);
      changes && instance.setState(changes);
    }
  }));
}

/**
 * Allows the user to set specify that when a certain key on the application
 * state changes, the values on that key will be mapped to the state object
 * on the component.
 *
 * @param  {Object} userMappings Takes the form `{appStateProp: ComponentClass}`
 *
 * @return {undefined}
 */
function mapStateToState(userMappings) {
  Object.keys(userMappings).forEach(key => {
    const componentClass = userMappings[key];
    mappings[componentClass.name] = key;
  });
}

export { mapStateToState, createMappingSubscribers };
