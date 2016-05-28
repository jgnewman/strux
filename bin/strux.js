'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Component = exports.createStore = exports.compose = exports.bindActionCreators = exports.applyMiddleware = exports.combineReducers = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     CONCEPT:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     Describe redux communications across your app all in one place. This will
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     eliminate the need to hunt down dispatches and subscriptions.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     EXAMPLE:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     ```
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     import Home from './home';
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     import { createStore } from 'strux';
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     const store = createStore(function reducer() { ... });
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     Home
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       .dispatches('MY_ACTION')
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       .when('componentDidMount')
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       .as(state => state);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     Other
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       .picksUp('MY_ACTION')
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       .then((appState, other) => {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         other.setState(appState);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       });
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     Home
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       .fetches('/api/v2/users/:id')
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       .when('componentDidMount', state => { return {id: 1} })
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       .thenDispatches('MY_ACTION')
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       .as(data => data);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     ```
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */

/*
 * Import the necessary items from React and Redux.
 */


var _redux = require('redux');

Object.defineProperty(exports, 'combineReducers', {
  enumerable: true,
  get: function get() {
    return _redux.combineReducers;
  }
});
Object.defineProperty(exports, 'applyMiddleware', {
  enumerable: true,
  get: function get() {
    return _redux.applyMiddleware;
  }
});
Object.defineProperty(exports, 'bindActionCreators', {
  enumerable: true,
  get: function get() {
    return _redux.bindActionCreators;
  }
});
Object.defineProperty(exports, 'compose', {
  enumerable: true,
  get: function get() {
    return _redux.compose;
  }
});

var _react = require('react');

var _dispatch = require('./lib/dispatch');

var _pickup = require('./lib/pickup');

var _fetch = require('./lib/fetch');

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
 * Track a reference to the store created by the user.
 */
var store = null;

/*
 * A symbol allowing us to hide Redux store subscriptions from the user.
 */
var UNSUBSCRIBE = Symbol.for('STRUX_UNSUBSCRIBE');

/*
 * Every time a dispatch occurs, we'll reset this variable first so that
 * when subscribers fire, they'll be able to know which action type
 * triggered the handler.
 */
var incomingAction = new (function () {
  function _class() {
    _classCallCheck(this, _class);

    this.action = null;
  }

  _createClass(_class, [{
    key: 'get',
    value: function get() {
      return this.action;
    }
  }, {
    key: 'set',
    value: function set(val) {
      this.action = val;
    }
  }]);

  return _class;
}())();

/*
 * We'll need to generate methods for each of these lifeCycle method names.
 */
var lifeCycle = ['componentDidMount', 'componentWillUnmount', 'componentWillMount', 'componentWillReceiveProps', 'shouldComponentUpdate', 'componentWillUpdate', 'componentDidUpdate'];

/**
 * @class
 *
 * Adds a layer to React's Component class for smoother Redux
 * work.
 */

var Component = function (_ReactComponent) {
  _inherits(Component, _ReactComponent);

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

  function Component() {
    var _Object$getPrototypeO;

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _classCallCheck(this, Component);

    var _this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(Component)).call.apply(_Object$getPrototypeO, [this].concat(args)));

    _this[UNSUBSCRIBE] = null;

    /*
     * Make sure we have an existing method for each life cycle method name.
     * We'll begin by getting a reference to the original method if the user
     * has already attached one.
     */
    lifeCycle.forEach(function (methodName) {
      var orig = _this[methodName];

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
      _this[methodName] = function () {
        for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        var out = orig ? orig.call.apply(orig, [_this].concat(args)) : undefined;
        methodName === 'shouldComponentUpdate' && !out && (out = false);
        methodName === 'componentDidMount' && (0, _pickup.createSubscribers)(incomingAction, store, _this);
        (0, _dispatch.runDispatches)(methodName, incomingAction, store, _this);
        (0, _fetch.runFetches)(methodName, incomingAction, store, _this);
        methodName === 'componentWillUnmount' && typeof _this[UNSUBSCRIBE] === 'function' && _this[UNSUBSCRIBE]();
        return out;
      };
    });
    return _this;
  }

  /**
   * A new static method that allows us to begin describing circumstances that
   * will cause instances of this component to trigger Redux dispatches.
   *
   * @param  {String} actionType A redux action type name.
   *
   * @return {Dispatch} Contains more methods for completing the description.
   */


  _createClass(Component, null, [{
    key: 'dispatches',
    value: function dispatches(actionType) {
      return new _dispatch.Dispatch(actionType, this.name);
    }

    /**
     * A new static method that allows us to begin describing that instances
     * of this component will subscribe to certain Redux action types.
     *
     * @param  {String} actionType A redux action type name.
     *
     * @return {Pickup} Contains more methods for completing the description.
     */

  }, {
    key: 'picksUp',
    value: function picksUp(actionType) {
      return new _pickup.Pickup(actionType, this.name);
    }

    /**
     * A new static method that allows us to begin describing circumstances that
     * will cause a data fetch within the application.
     *
     * @param  {String} url    The datapoint.
     * @param  {Object} config An object modifying the call made _a la_ the fetch api.
     *
     * @return {Pickup} Contains more methods for completing the description.
     */

  }, {
    key: 'fetches',
    value: function fetches(url, config) {
      return new _fetch.Fetch(url, config, this.name);
    }
  }]);

  return Component;
}(_react.Component);

/**
 * Override Redux's createStore with a version that allows us to keep
 * track of the store the user creates.
 *
 * @param  {Arguments} ...args Usually a reducer function.
 *
 * @return A Redux store.
 */


function createStore() {
  store = _redux.createStore.apply(undefined, arguments);
  return store;
}

/*
 * Users will be able to use this module INSTEAD of Redux as it passes
 * through all the necessary top level pieces as well as our new component type.
 */
exports.createStore = createStore;
exports.Component = Component;