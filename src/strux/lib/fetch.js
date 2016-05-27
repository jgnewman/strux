/*

Allows syntax such as:

```
Home
  .fetches('/api/v2/users/:id')
  .when('componentDidMount', state => { return {id: 1} })
  .thenDispatches('MY_ACTION')
  .as(data => data);
```

*/

/*
 * Holds descriptions for all data fetching throughout the application.
 * The tree takes the following form:
 *   fetches = {
 *     componentDidMount: {
 *       ComponentClassName: [ { url: '/example', config: {...} } ]
 *     }
 *   }
 */
const fetches = {};

/**
 * An empty function we can reuse.
 *
 * @return {undefined}
 */
function emptyFn() { return {} }

/**
 * Recursively replaces all instances of a single placeholder value in a URL
 * with its actual value.
 *
 * @param  {String} url   A string such as '/api/v1/users/:id'.
 * @param  {String} key   The placeholder value to look for such as 'id'.
 * @param  {Any}    value A serializable value to swap in for the placheholder.
 *
 * @return {String}       The translated string such as '/api/v1/users/1'.
 */
function replaceValue(url, key, value) {
  const colonKey = `:${key}`;
  const val = typeof value === 'string' ? value : JSON.stringify(value);
  if (url.indexOf(colonKey) > -1) {
    url = url.replace(colonKey, val);
    return replaceValue(url, key, val);
  } else {
    return url;
  }
}

/**
 * Replaces placeholder URL values with their actual equivalents.
 *
 * @param  {String} url     A string such as '/api/v1/users/:id'.
 * @param  {Object} valsObj Contains values such as {id: 1}.
 *
 * @return {String}         The translated string such as '/api/v1/users/1'.
 */
function replaceURLVars(url, valsObj) {
  let newURL = url;
  Object.keys(valsObj).forEach(key => {
    const val = valsObj[key];
    newURL = replaceValue(newURL, key, val);
  });
  return newURL;
}

/**
 * Attempts to parse an item into JSON. If it doesn't work,
 * returns the item unmodified.
 *
 * @param  {Any} data The data to parse.
 *
 * @return {Any}      Either the parsed data or the unmodified data.
 */
function tryToParse(data) {
  try {
    return JSON.parse(data);
  } catch (e) {
    return data;
  }
}

/**
 * @class
 *
 * Builds a level of the dispatches tree.
 */
class FetchDescription {

  /**
   * @constructor
   *
   * Sets up important properties on the instance.
   *
   * @param  {String} actionType  A redux action name.
   * @param  {Object} config      Stores all the properties we'll need as we build a fetch.
   *
   * @return {undefined}
   */
  constructor(actionType, config) {
    this.config = Object.assign({}, config, {
      actionType: actionType
    });
  }

  /**
   * Allows the user to specify what to do with the result of the action.
   *
   * @param  {Function} transformer Should return an object that will constitute an action.
   *
   * @return {undefined}
   */
  as(transformer) {
    const config = this.config;
    fetches[config.triggerMethod][config.className].push(Object.assign({}, config, {
      dataTransformer: transformer
    }));
  }
}

/**
 * @class
 *
 * Builds a level of the dispatches tree.
 */
class DispatchBuilder {

  /**
   * @constructor
   *
   * Sets up important properties on the instance.
   *
   * @param  {String}   triggerMethod The name of the component method triggering a fetch.
   * @param  {Function} translator    How to switch out url vars.
   * @param  {Object}   config        Stores all the properties we'll need as we build a fetch.
   *
   * @return {undefined}
   */
  constructor(triggerMethod, translator, config) {
    this.config = Object.assign({}, config, {
      triggerMethod: triggerMethod,
      translator: translator
    });
  }

  /**
   * Allows the user to specify a redux action associated with the data return.
   *
   * @param  {String} actionType A redux action type name.
   *
   * @return {ActionBuilder} Contains more functionality for completing the description.
   */
  thenDispatches(actionType) {
    return new FetchDescription(actionType, this.config);
  }
}

/**
 * @class
 *
 * Builds a level of the fetches tree.
 */
class Fetch {

  /**
   * @constructor
   *
   * Sets up important properties on the instance.
   *
   * @param  {String} url        The URL to fetch.
   * @param  {Object} config     Ajax configuration object for `fetch`.
   * @param  {String} className  The name of the class that brought us here.
   *
   * @return {undefined}
   */
  constructor(url, config, className) {
    this.url = url;
    this.config = config || {};
    this.className = className;
  }

  /**
   * Allows the user to specify a component method that will trigger the fetch.
   *
   * @param  {String}   triggerMethod The method name.
   * @param  {Function} translator    How to modify URL vars.
   *
   * @return {DispatchBuilder} Contains more functionality for completing the description.
   */
  when(triggerMethod, translator) {
    translator = translator || emptyFn;
    fetches[triggerMethod] = fetches[triggerMethod] || {};
    fetches[triggerMethod][this.className] = fetches[triggerMethod][this.className] || [];
    return new DispatchBuilder(triggerMethod, translator, this);
  }
}

/**
 * Locates the proper fetch functions to fire for a given
 * class and method name, and fires them.
 *
 * @param  {String} event          Such as 'componentDidMount'.
 * @param  {Object} incomingAction Allows us to get and set the incoming Redux action.
 * @param  {Object} store          A redux store.
 * @param  {Object} instance       An instance of an XComponent extended class.
 *
 * @return {undefined}
 */
function runFetches (event, incomingAction, store, instance) {

  /*
   * Make sure we have an array of actions to loop over.
   */
  let actions = fetches[event];
  if (actions) {
    actions = actions[instance.constructor.name];
  }

  /*
   * Each object in the array will take the form {
   *   url: '/api/v2/users/:id',
   *   config: { ... },
   *   className: 'Foo',
   *   triggerMethod: 'componentDidMount',
   *   translator: FUNCTION,
   *   actionType: 'MY_ACTION',
   *   dataTransformer: FUNCTION
   * }.
   *
   * For each object, we'll build a clean URL by replacing any url vars
   * that may exist within the provided url.
   *
   * We'll perform a fetch on the clean URL using the user's provided
   * config data. When the data comes back, we'll run the provided
   * data transformer on it and dispatch a redux action.
   */
  actions && actions.forEach(item => {
    const cleanURL = replaceURLVars(item.url, item.translator(instance.state || {}));

    /*
     * Perform a fetch. If it's ok resolve it. If not, reject it.
     */
    const fetched = fetch(cleanURL, item.config).then(response => {
      return response.ok ? Promise.resolve(response)
                         : Promise.reject(new Error(response.statusText));
    });

    /*
     * When the fetch resolves, read it to text then pass it
     * through the user-prived transformer, set the incoing action,
     * and dispatch an action.
     */
    fetched.then(data => data.text())
           .then(data => {
             const action = item.dataTransformer(tryToParse(data), instance.state || {});
             incomingAction.set(item.actionType);
             store.dispatch(Object.assign({...action, type: item.actionType}));
           });
  });


}

export { Fetch, runFetches };
