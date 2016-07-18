'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.default = reducer;

var _redux = require('redux');

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * A reducer for our redux store.
 *
 * @param  {Object} currentState Defaults to our originalState values.
 * @param  {Object} actionObject Contains data about the state change.
 *
 * @return {Object}              Denotes the new application state.
 */
function reducer() {
  var currentState = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var actionObject = arguments[1];

  var _ret = function () {
    switch (actionObject.type) {

      /*
       * When we detect a component state change, we want to make sure its
       * values are reflected in the global state and that this change is
       * tracked as our most recent change.
       */
      case utils.STATE_CHANGE:
        var newState = Object.assign({}, currentState);
        var className = actionObject.className;
        var oldVals = actionObject.oldVals;
        var newVals = actionObject.newVals;
        var update = void 0;

        /*
         * If the current state is not yet tracking values for the class
         * in question, add all the values to the new state and mark them
         * all as updated.
         */
        if (!currentState[className]) {
          newState[className] = newVals;
          update = {};
          utils.eachKey(newVals, function (val, key) {
            return update[key] = [oldVals[key], val];
          });

          /*
           * Otherwise, compare the current state with the new state and
           * collect all the values that have changed.
           */
        } else {
          (function () {
            var subState = newState[className];
            update = {};
            utils.eachKey(newVals, function (val, key) {
              update[key] = [oldVals[key], val];
              subState[key] = val;
            });
          })();
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

/*
 * Create a redux store using our reducer.
 */
var store = (0, _redux.createStore)(reducer);

exports.default = store;