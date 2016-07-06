/*
 * We'll need to generate methods for each of these lifeCycle method names.
 */
const lifeCycleMethods = new Set([
  'componentDidMount',
  'componentWillUnmount',
  'componentWillMount',
  'componentWillReceiveProps',
  'shouldComponentUpdate',
  'componentWillUpdate',
  'componentDidUpdate'
]);

const customMethods = new Set();

export { lifeCycleMethods, customMethods };
