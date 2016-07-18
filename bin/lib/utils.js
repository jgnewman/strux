'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.eachKey = eachKey;
exports.isFn = isFn;
exports.caresAboutChange = caresAboutChange;
/*
 * connections {
 *   ObserverClassName: {
 *     ObservedClassName: {
 *       observedValueName: [ 'change'|'always', () => {} ]
 *     }
 *   }
 * }
 */
var connections = exports.connections = {};
var mostRecentChange = exports.mostRecentChange = { className: null, update: null };
var STATE_CHANGE = exports.STATE_CHANGE = '_STATE_CHANGE';

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
function caresAboutChange(className) {
  var recentChange = arguments.length <= 1 || arguments[1] === undefined ? mostRecentChange : arguments[1];

  var update = recentChange.update;
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
       * For each of those names found in the update, run the validator
       * and determine whether or not we care about the change that
       * occurred. If so, add it to the output.
       */
      var oldVal = update[valueName][0];
      var newVal = update[valueName][1];
      var validatorEvt = validator[0];
      var validatorCheck = validator[1];
      if (validatorEvt === 'change' && oldVal === newVal) return;
      if (validatorEvt !== 'change' && validatorEvt !== 'always') {
        throw new Error(validatorEvt + ' is not a valid validator event.');
      }
      if (validatorCheck === true || validatorCheck(newVal, oldVal)) {
        output[valueName] = newVal;
      }
    });
  }
  return Object.keys(output).length ? output : undefined;
}