'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/*
 * We'll need to generate methods for each of these lifeCycle method names.
 */
var lifeCycleMethods = new Set(['componentDidMount', 'componentWillUnmount', 'componentWillMount', 'componentWillReceiveProps', 'shouldComponentUpdate', 'componentWillUpdate', 'componentDidUpdate']);

var customMethods = new Set();

exports.lifeCycleMethods = lifeCycleMethods;
exports.customMethods = customMethods;