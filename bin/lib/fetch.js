'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
var fetches = {};

/**
 * An empty function we can reuse.
 *
 * @return {undefined}
 */
function emptyFn() {
  return {};
}

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
  var colonKey = ':' + key;
  var val = typeof value === 'string' ? value : JSON.stringify(value);
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
  var newURL = url;
  Object.keys(valsObj).forEach(function (key) {
    var val = valsObj[key];
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

var FetchDescription = function () {

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

  function FetchDescription(actionType, config) {
    _classCallCheck(this, FetchDescription);

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


  _createClass(FetchDescription, [{
    key: 'as',
    value: function as(transformer) {
      var config = this.config;
      fetches[config.triggerMethod][config.className].push(Object.assign({}, config, {
        dataTransformer: transformer
      }));
    }
  }]);

  return FetchDescription;
}();

/**
 * @class
 *
 * Builds a level of the dispatches tree.
 */


var DispatchBuilder = function () {

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

  function DispatchBuilder(triggerMethod, translator, config) {
    _classCallCheck(this, DispatchBuilder);

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


  _createClass(DispatchBuilder, [{
    key: 'thenDispatches',
    value: function thenDispatches(actionType) {
      return new FetchDescription(actionType, this.config);
    }
  }]);

  return DispatchBuilder;
}();

/**
 * @class
 *
 * Builds a level of the fetches tree.
 */


var Fetch = function () {

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

  function Fetch(url, config, className) {
    _classCallCheck(this, Fetch);

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


  _createClass(Fetch, [{
    key: 'when',
    value: function when(triggerMethod, translator) {
      translator = translator || emptyFn;
      fetches[triggerMethod] = fetches[triggerMethod] || {};
      fetches[triggerMethod][this.className] = fetches[triggerMethod][this.className] || [];
      return new DispatchBuilder(triggerMethod, translator, this);
    }
  }]);

  return Fetch;
}();

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


function runFetches(event, incomingAction, store, instance) {

  /*
   * Make sure we have an array of actions to loop over.
   */
  var actions = fetches[event];
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
  actions && actions.forEach(function (item) {
    var cleanURL = replaceURLVars(item.url, item.translator(instance.state || {}));

    /*
     * Perform a fetch. If it's ok resolve it. If not, reject it.
     */
    var fetched = fetch(cleanURL, item.config).then(function (response) {
      return response.ok ? Promise.resolve(response) : Promise.reject(new Error(response.statusText));
    });

    /*
     * When the fetch resolves, read it to text then pass it
     * through the user-prived transformer, set the incoing action,
     * and dispatch an action.
     */
    fetched.then(function (data) {
      return data.text();
    }).then(function (data) {
      var action = item.dataTransformer(tryToParse(data), instance.state || {});
      incomingAction.set(item.actionType);
      store.dispatch(Object.assign(_extends({}, action, { type: item.actionType })));
    });
  });
}

exports.Fetch = Fetch;
exports.runFetches = runFetches;