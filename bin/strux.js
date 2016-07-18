'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.store = exports.Component = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _react = require('react');

var _store = require('./lib/store');

var _store2 = _interopRequireDefault(_store);

var _utils = require('./lib/utils');

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
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

    var didMount = utils.isFn(_this.componentDidMount) ? _this.componentDidMount.bind(_this) : _this.componentDidMount;

    var willUnmount = utils.isFn(_this.componentWillUnmount) ? _this.componentWillUnmount.bind(_this) : _this.componentWillUnmount;

    var unsubscribe = void 0;

    /*
     * Overwrite componentDidMount to automatically subscribe to state
     * changes. If this component cares about the changes, and if this
     * component has a componentTakesState function, call it.
     */
    _this.componentDidMount = function () {
      var selfName = _this.constructor.name;
      unsubscribe = _store2.default.subscribe(function () {
        if (typeof _this.componentTakesState === 'function') {
          var instanceCares = utils.caresAboutChange(selfName);
          if (instanceCares) {
            _this.componentTakesState(_store2.default.getState(), utils.mostRecentChange.className, instanceCares);
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

  /*
   * Overwrite setState such that whenever the state is updated,
   * we will automatically trigger a corresponding update on the
   * global state.
   */


  _createClass(Component, [{
    key: 'setState',
    value: function setState(values, callback) {
      var _this2 = this;

      var curVals = this.state;
      _get(Object.getPrototypeOf(Component.prototype), 'setState', this).call(this, values, function () {
        _store2.default.dispatch({
          type: utils.STATE_CHANGE,
          className: _this2.constructor.name,
          oldVals: curVals,
          newVals: _this2.state
        });
        return callback ? callback.apply(undefined, arguments) : undefined;
      });
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

  }], [{
    key: 'takesStateWhen',
    value: function takesStateWhen(params) {
      var connection = utils.connections[this.name] = {};
      utils.eachKey(params, function (options, className) {
        var values = connection[className] = {};
        utils.eachKey(options, function (validator, valName) {
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
exports.store = _store2.default;