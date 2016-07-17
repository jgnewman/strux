/*

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
import { Component as ReactComponent } from 'react';
import { createStore } from 'redux';

/*
 * connections {
 *   ObserverClassName: {
 *     ObservedClassName: {
 *       observedValueName: [ 'change'|'always', () => {} ]
 *     }
 *   }
 * }
 */
const connections = {};
const originalState = {};
const mostRecentChange = { className: null, diff: null };
let store;

/**
 * Performs `forEach` over an object.
 *
 * @param  {Object}   object   A key/value collection.
 * @param  {Function} callback The function to run on each pair.
 *
 * @return {undefined}
 */
function eachKey(object, callback) {
  return Object.keys(object).forEach(key => callback(object[key], key));
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
function reducer(currentState = originalState, actionObject) {
  switch(actionObject.type) {

    /*
     * When we detect a component state change, we want to make sure its
     * values are reflected in the global state and that this change is
     * tracked as our most recent change.
     */
    case '_COMPONENT_STATE_CHANGE':
      const newState = Object.assign({}, currentState);
      const className = actionObject.className;
      const oldVals = actionObject.oldVals;
      const newVals = actionObject.newVals;
      let   diff;

      /*
       * If the current state is not yet tracking values for the class
       * in question, add all the values to the new state and mark them
       * all as diffed.
       */
      if (!currentState[className]) {
        newState[className] = newVals;
        diff = {};
        eachKey(newVals, (val, key) => diff[key] = [oldVals[key], val]);

      /*
       * Otherwise, compare the current state with the new state and
       * collect all the values that have changed.
       */
      } else {
        const comparison = currentState[className]
        diff = {};
        eachKey(newVals, (val, key) => {
          const oldVal = comparison[key];
          if (val !== oldVal) {
            diff[key] = [oldVal, val];
          }
        });
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
      return newState;

    default:
      return currentState;
  }
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
  const diff    = recentChange.diff;
  const mapping = connections[className][recentChange.className];
  const output  = {};

  /*
   * If the instance cares about changes coming from this type of class...
   */
  if (mapping) {

    /*
     * Check each of the value names it cares about for that class.
     */
    eachKey(mapping, (validator, valueName) => {

      /*
       * If one of those names is found in the diff, run the validator
       * and determine whether or not we care about the change that
       * occurred. If so, add it to the output.
       */
      if (diff[valueName]) {
        const oldVal = diff[valueName][0];
        const newVal = diff[valueName][1];
        const validatorEvt   = validator[0];
        const validatorCheck = validator[1];
        if (validatorEvt === 'change' && oldVal === newVal) return;
        if (validatorEvt !== 'change' && validatorEvt !== 'always') {
          throw new Error(`${validatorEvt} is not a valid validator event.`);
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
store = createStore(reducer);

/**
 * @class
 *
 * Extends React's Component to give you a component that ties automatically
 * into Redux.
 */
class Component extends ReactComponent {

  /**
   * @constructor
   *
   * Builds the class.
   */
  constructor(...args) {
    super(...args);

    const setState = isFn(this.setState)
                   ? this.setState.bind(this)
                   : this.setState;

    const didMount = isFn(this.componentDidMount)
                   ? this.componentDidMount.bind(this)
                   : this.componentDidMount;

    const willUnmount = isFn(this.componentWillUnmount)
                      ? this.componentWillUnmount.bind(this)
                      : this.componentWillUnmount;

    let unsubscribe;

    /*
     * Overwrite setState such that whenever the state is updated,
     * we will automatically trigger a corresponding update on the
     * global state.
     */
    this.setState = (values, callback) => {
      const curVals = this.state;
      setState(values, (...args) => {
        store.dispatch({
          type: '_COMPONENT_STATE_CHANGE',
          className: this.constructor.name,
          oldVals: curVals,
          newVals: this.state
        });
        return callback ? callback(...args) : undefined;
      });
    };

    /*
     * Overwrite componentDidMount to automatically subscribe to state
     * changes. If this component cares about the changes, and if this
     * component has a componentTakesState function, call it.
     */
    this.componentDidMount = (...args) => {
      const selfName = this.constructor.name;
      unsubscribe = store.subscribe(() => {
        if (typeof this.componentTakesState === 'function') {
          const instanceCares = caresAboutChange(selfName, mostRecentChange);
          if (instanceCares) {
            this.componentTakesState(
              store.getState(),
              mostRecentChange.className,
              instanceCares
            );
          }
        }
      });
      return didMount ? didMount(...args) : undefined;
    };

    /*
     * Overwrite componentWillUnmount to automatically unsubscribe
     * whenever the component is going to unmount.
     */
    this.componentWillUnmount = (...args) => {
      unsubscribe();
      return willUnmount ? willUnmount(...args) : undefined;
    };

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
  static reactsWhen(params) {
    const connection = connections[this.name] = {};
    eachKey(params, (options, className) => {
      const values = connection[className] = {};
      eachKey(options, (validator, valName) => {
        if (!Array.isArray(validator)) {
          validator = ['change', validator];
        }
        values[valName] = validator;
      });
    });
  }
}

export { Component, store };
