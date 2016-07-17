'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.store = exports.Component = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; }; /*
                                                                                                                                                                                                                                                  
                                                                                                                                                                                                                                                  CONCEPT:
                                                                                                                                                                                                                                                  Describe redux communications across your app all in one place. This will
                                                                                                                                                                                                                                                  eliminate the need to hunt down dispatches and subscriptions.
                                                                                                                                                                                                                                                  
                                                                                                                                                                                                                                                  EXAMPLE:
                                                                                                                                                                                                                                                  
                                                                                                                                                                                                                                                  ```
                                                                                                                                                                                                                                                  import { Component } from 'strux';
                                                                                                                                                                                                                                                  
                                                                                                                                                                                                                                                  class Comp1 extends Component {
                                                                                                                                                                                                                                                    constructor() {
                                                                                                                                                                                                                                                      super();
                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                    componentDidMount() {
                                                                                                                                                                                                                                                      this.setState({
                                                                                                                                                                                                                                                        foo: 1,
                                                                                                                                                                                                                                                        bar: 2
                                                                                                                                                                                                                                                      });
                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                    componentTakesState(state, className, diff) {
                                                                                                                                                                                                                                                      doStuff(state);
                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                  }
                                                                                                                                                                                                                                                  
                                                                                                                                                                                                                                                  class Comp2 extends Component {
                                                                                                                                                                                                                                                    constructor() {
                                                                                                                                                                                                                                                      super();
                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                    componentDidMount() {
                                                                                                                                                                                                                                                      this.setState({
                                                                                                                                                                                                                                                        baz: 3,
                                                                                                                                                                                                                                                        qux: 4
                                                                                                                                                                                                                                                      });
                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                    componentTakesState(state, className, diff) {
                                                                                                                                                                                                                                                      doStuff(state);
                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                  }
                                                                                                                                                                                                                                                  
                                                                                                                                                                                                                                                  Comp2.reactsWhen({
                                                                                                                                                                                                                                                    Comp1: {
                                                                                                                                                                                                                                                      foo: (newVal, oldVal) => newVal > 0,
                                                                                                                                                                                                                                                      bar: true
                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                  });
                                                                                                                                                                                                                                                  
                                                                                                                                                                                                                                                  Comp1.reactsWhen({
                                                                                                                                                                                                                                                    Comp2: {
                                                                                                                                                                                                                                                      baz: ['always', (newVal, oldVal) => newVal !== oldVal],
                                                                                                                                                                                                                                                      qux: ['change', newVal => whatever(newVal)]
                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                  });
                                                                                                                                                                                                                                                  ```
                                                                                                                                                                                                                                                  
                                                                                                                                                                                                                                                  */

/*
 * Import the necessary items from React and Redux.
 */


var _react = require('react');

var _redux = require('redux');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * connections {
 *   ObserverClassName: {
 *     ObservedClassName: {
 *       observedValueName: [ 'change'|'always', () => {} ]
 *     }
 *   }
 * }
 */
var connections = {};
var originalState = {};
var mostRecentChange = { className: null, diff: null };
var store = void 0;

/**
 * Performs `forEach` over an object.
 *
 * @param  {Object}   object   A key/value collection.
 * @param  {Function} callback The function to run on each pair.
 *
 * @return {undefined}
 */
function eachKey(object, callback) {
  return Object.keys(object).forEach(function (key) {
    return callback(object[key], key);
  });
}

/**
 * Determines whether a value is a function.
 *
 * @param  {Any}     val Any value.
 *
 * @return {Boolean}     Whether or not `val` is a function.
 */
function isFn(val) {
  return typeof val === 'function';
}

/**
 * A reducer for our redux store.
 *
 * @param  {Object} currentState Defaults to our originalState values.
 * @param  {Object} actionObject Contains data about the state change.
 *
 * @return {Object}              Denotes the new application state.
 */
function reducer() {
  var currentState = arguments.length <= 0 || arguments[0] === undefined ? originalState : arguments[0];
  var actionObject = arguments[1];

  var _ret = function () {
    switch (actionObject.type) {

      /*
       * When we detect a component state change, we want to make sure its
       * values are reflected in the global state and that this change is
       * tracked as our most recent change.
       */
      case '_COMPONENT_STATE_CHANGE':
        var newState = Object.assign({}, currentState);
        var className = actionObject.className;
        var oldVals = actionObject.oldVals;
        var newVals = actionObject.newVals;
        var diff = void 0;

        /*
         * If the current state is not yet tracking values for the class
         * in question, add all the values to the new state and mark them
         * all as diffed.
         */
        if (!currentState[className]) {
          newState[className] = newVals;
          diff = {};
          eachKey(newVals, function (val, key) {
            return diff[key] = [oldVals[key], val];
          });

          /*
           * Otherwise, compare the current state with the new state and
           * collect all the values that have changed.
           */
        } else {
          (function () {
            var comparison = currentState[className];
            var subState = newState[className];
            diff = {};
            eachKey(newVals, function (val, key) {
              var oldVal = comparison[key];
              if (val !== oldVal) {
                diff[key] = [oldVal, val];
                subState[key] = val;
              }
            });
          })();
        }

        /*
         * Mark which class triggered the most recent change.
         * Also attach the diff to that record.
         */
        mostRecentChange.className = className;
        mostRecentChange.diff = diff;

        /*
         * Update to the new state.
         */
        return {
          v: newState
        };

      default:
        return {
          v: currentState
        };
    }
  }();

  if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
}

/**
 * Determines whether or not an instance of a class cares about any
 * changes that have recently occurred.
 *
 * @param  {String} className    The name of the class instance in question.
 * @param  {Object} recentChange Contains information about the most recent
 *                               state change.
 *
 * @return {Object|undefined}    The object contains all values that are
 *                               cared about by the class instance.
 */
function caresAboutChange(className, recentChange) {
  var diff = recentChange.diff;
  var mapping = connections[className][recentChange.className];
  var output = {};

  /*
   * If the instance cares about changes coming from this type of class...
   */
  if (mapping) {

    /*
     * Check each of the value names it cares about for that class.
     */
    eachKey(mapping, function (validator, valueName) {

      /*
       * If one of those names is found in the diff, run the validator
       * and determine whether or not we care about the change that
       * occurred. If so, add it to the output.
       */
      if (diff[valueName]) {
        var oldVal = diff[valueName][0];
        var newVal = diff[valueName][1];
        var validatorEvt = validator[0];
        var validatorCheck = validator[1];
        if (validatorEvt === 'change' && oldVal === newVal) return;
        if (validatorEvt !== 'change' && validatorEvt !== 'always') {
          throw new Error(validatorEvt + ' is not a valid validator event.');
        }
        if (validatorCheck === true || validatorCheck(newVal, oldVal)) {
          output[valueName] = newVal;
        }
      }
    });
  }
  return Object.keys(output).length ? output : undefined;
}

/*
 * Create a redux store using our reducer.
 */
exports.store = store = (0, _redux.createStore)(reducer);

/**
 * @class
 *
 * Extends React's Component to give you a component that ties automatically
 * into Redux.
 */

var Component = function (_ReactComponent) {
  _inherits(Component, _ReactComponent);

  /**
   * @constructor
   *
   * Builds the class.
   */

  function Component() {
    var _Object$getPrototypeO;

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _classCallCheck(this, Component);

    var _this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(Component)).call.apply(_Object$getPrototypeO, [this].concat(args)));

    var setState = isFn(_this.setState) ? _this.setState.bind(_this) : _this.setState;

    var didMount = isFn(_this.componentDidMount) ? _this.componentDidMount.bind(_this) : _this.componentDidMount;

    var willUnmount = isFn(_this.componentWillUnmount) ? _this.componentWillUnmount.bind(_this) : _this.componentWillUnmount;

    var unsubscribe = void 0;

    /*
     * Overwrite setState such that whenever the state is updated,
     * we will automatically trigger a corresponding update on the
     * global state.
     */
    _this.setState = function (values, callback) {
      var curVals = _this.state;
      setState(values, function () {
        store.dispatch({
          type: '_COMPONENT_STATE_CHANGE',
          className: _this.constructor.name,
          oldVals: curVals,
          newVals: _this.state
        });
        return callback ? callback.apply(undefined, arguments) : undefined;
      });
    };

    /*
     * Overwrite componentDidMount to automatically subscribe to state
     * changes. If this component cares about the changes, and if this
     * component has a componentTakesState function, call it.
     */
    _this.componentDidMount = function () {
      var selfName = _this.constructor.name;
      unsubscribe = store.subscribe(function () {
        if (typeof _this.componentTakesState === 'function') {
          var instanceCares = caresAboutChange(selfName, mostRecentChange);
          if (instanceCares) {
            _this.componentTakesState(store.getState(), mostRecentChange.className, instanceCares);
          }
        }
      });
      return didMount ? didMount.apply(undefined, arguments) : undefined;
    };

    /*
     * Overwrite componentWillUnmount to automatically unsubscribe
     * whenever the component is going to unmount.
     */
    _this.componentWillUnmount = function () {
      unsubscribe();
      return willUnmount ? willUnmount.apply(undefined, arguments) : undefined;
    };

    return _this;
  }

  /**
   * @static
   *
   * A new static method allowing us to describe the conditions that will
   * trigger redux store dispatches.
   *
   * @param  {Object} params A description of class names and their state values
   *                         we want this class to observe.
   *
   * @return {undefined}
   */


  _createClass(Component, null, [{
    key: 'reactsWhen',
    value: function reactsWhen(params) {
      var connection = connections[this.name] = {};
      eachKey(params, function (options, className) {
        var values = connection[className] = {};
        eachKey(options, function (validator, valName) {
          if (!Array.isArray(validator)) {
            validator = ['change', validator];
          }
          values[valName] = validator;
        });
      });
    }
  }]);

  return Component;
}(_react.Component);

exports.Component = Component;
exports.store = store;