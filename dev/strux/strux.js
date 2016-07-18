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
import store from './lib/store';
import * as utils from './lib/utils';


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

    const didMount = utils.isFn(this.componentDidMount)
                   ? this.componentDidMount.bind(this)
                   : this.componentDidMount;

    const willUnmount = utils.isFn(this.componentWillUnmount)
                      ? this.componentWillUnmount.bind(this)
                      : this.componentWillUnmount;

    let unsubscribe;

    /*
     * Overwrite componentDidMount to automatically subscribe to state
     * changes. If this component cares about the changes, and if this
     * component has a componentTakesState function, call it.
     */
    this.componentDidMount = (...args) => {
      const selfName = this.constructor.name;
      unsubscribe = store.subscribe(() => {
        if (typeof this.componentTakesState === 'function') {
          const instanceCares = utils.caresAboutChange(selfName);
          if (instanceCares) {
            this.componentTakesState(
              store.getState(),
              utils.mostRecentChange.className,
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

  /*
   * Overwrite setState such that whenever the state is updated,
   * we will automatically trigger a corresponding update on the
   * global state.
   */
  setState(values, callback) {
    const curVals = this.state;
    super.setState(values, (...args) => {
      store.dispatch({
        type: utils.STATE_CHANGE,
        className: this.constructor.name,
        oldVals: curVals,
        newVals: this.state
      });
      return callback ? callback(...args) : undefined;
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
  static takesStateWhen(params) {
    const connection = utils.connections[this.name] = {};
    utils.eachKey(params, (options, className) => {
      const values = connection[className] = {};
      utils.eachKey(options, (validator, valName) => {
        if (!Array.isArray(validator)) {
          validator = ['change', validator];
        }
        values[valName] = validator;
      });
    });
  }
}

export { Component, store };
