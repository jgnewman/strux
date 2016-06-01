'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
var pickups = {};

/*
 * A symbol allowing us to hide Redux store subscriptions from the user.
 */
var UNSUBSCRIBERS = Symbol.for('STRUX_UNSUBSCRIBE');

/**
 * @class
 *
 * Builds a level of the pickups tree.
 */

var Pickup = function () {

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

  function Pickup(actionType, className) {
    _classCallCheck(this, Pickup);

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


  _createClass(Pickup, [{
    key: 'then',
    value: function then(handler) {
      pickups[this.className] = pickups[this.className] || {};
      pickups[this.className][this.actionType] = pickups[this.className][this.actionType] || [];
      pickups[this.className][this.actionType].push(handler);
    }
  }]);

  return Pickup;
}();

/**
 * Creates implicit subscriptions to Redux actions for a rendered component.
 *
 * @param  {Object} incomingAction Allows us to get and set the incoming Redux action.
 * @param  {Object} store          A redux store.
 * @param  {Object} instance       An instance of an XComponent extended class.
 *
 * @return {undefined}
 */


function createPickupSubscribers(incomingAction, store, instance) {
  instance[UNSUBSCRIBERS].push(store.subscribe(function () {
    var relevantPickups = pickups[instance.constructor.name];
    if (relevantPickups) {
      relevantPickups = relevantPickups[incomingAction.get()];
    }
    if (relevantPickups) {
      (function () {
        var state = store.getState();
        relevantPickups.forEach(function (handler) {
          return handler(state, instance);
        });
      })();
    }
  }));
}

exports.Pickup = Pickup;
exports.createPickupSubscribers = createPickupSubscribers;