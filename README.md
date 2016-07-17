# Strux

Cross-component communication _finally_ made simple.

> Watch out! There are breaking changes in version 1.0!

## What is Strux?

Strux is designed for React.js. It's a layer on top of Redux that allows
you to describe communication between application components in a revolutionary
way – as a separate concern.

## What problem does it solve?

**In short, you don't write disptaches and subscribes _within_ your components.
Instead, use Strux to just plug those components together in another file.**

tl;dr; –

Although Redux has solved a big piece of the spaghetti code problem, it can
still be remarkably difficult to understand the flow of data between
components at a high level. For example, if component A subscribes to an action,
there is no good way within component A to tell where that action
is coming from or what conditions trigger it.

Strux attempts to provide a paradigm wherein cross-component communication
can be fully described in one cohesive place, thus making it extremely easy to
understand which components are dispatching which actions and which components
are picking those up.

## How does it work?

Strux makes working with redux simpler than it's ever been. All you have
to do is build your components using Strux's `Component` class and all the grunt
work will be handled for you, allowing you to plug your components together
however you'd like.

There is no need to create a store, write a reducer, map state to props,
dispatch actions, subscribe to dispatches, or anything else.

Here's a full, working example:

```javascript
// Notice we're not importing this from React.
import { Component } from 'strux';

// All we're doing here is creating a (mostly) standard class.
// We'll come back to this.
class Foo extends Component {
  constructor() {
    super();
  }
  componentDidMount() {
    this.setState({
      value1: 1,
      value2: 2
    });
  }
  componentTakesState(appState, triggerClass, diff) {
    console.log('Redux application state:', appState);
    console.log('Name of class that triggered the action:', triggerClass);
    console.log('Relevant values that changed:', diff);
  }
  render() {
    return <div>Hello</div>
  }
}

// And let's create another class here, just for fun.
class Bar extends Component {
  constructor() {
    super();
  }
  componentDidMount() {
    this.setState({
      valueA: 'A',
      valueB: 'B'
    });
  }
  componentTakesState(appState, triggerClass, diff) {
    console.log('Redux application state:', appState);
    console.log('Name of class that triggered the action:', triggerClass);
    console.log('Relevant values that changed:', diff);
  }
  render() {
    return <div>Goodbye</div>
  }
}

// Now we can describe how these components will pass
// data to each other.

// The Foo class will take new data whenever the `valueA` value
// changes on the Bar class.
Foo.reactsWhen({
  Bar: {
    valueA: true
  }
});

// The Bar class will take new data whenever the `value1` and/or
// `value2` values change on the Foo class, as long as at least one
// of the validator functions returns true.
Bar.reactsWhen({
  Foo: {
    value1: newVal => newVal > 0,
    value2: (newVal, oldVal) => newVal !== oldVal
  }
});
```

## Can you walk me through what's going on in that example?

Sure thing.

By using Strux's extension of React's `Component` class, you get access to
2 new features:

1. A new static class called `reactsWhen`.
2. A new lifecycle method called `componentTakesState`.

In addition to having these new methods exposed, Strux works behind the scenes
to automatically map each component state to an object within the global
application state held by Redux. So, for example, if you had 2 Strux
Components called Foo and Bar, the resulting Redux state would look like this:

```javascript
{
  Foo: { ...Foo_component_state },
  Bar: { ...Bar_component_state }
}
```

Whenever you call `setState`, Strux will automatically keep your application
state up-to-date with the newest values. As such, calling `reactsWhen` will
allow you to describe how a given component will observe those values on
other components and decide whether or not to react to them when they are
updated. If the decision to react is made, that data will be passed in to the
component's `componentTakesState` method automatically.

In the above example we wrote the following:

```javascript
Foo.reactsWhen({
  Bar: {
    valueA: true
  }
});
```

Here, we've passed an object to `reactsWhen` containing the names of all other
Strux components the Foo class cares about. For each of those (in this case
only Bar), we write the names of state values on that class we'd like to
observe. By assigning `true` to one of these names, we're saying that whenever
the Bar class calls `setState` and updates its `valueA` property, the
`componentTakesState` method on the Foo class will be called automatically and
handed that data.

On the other hand, we have some other options for how to handle writing a
`reactsWhen` call. Take the following example:

```javascript
Bar.reactsWhen({
  Foo: {
    value1: newVal => newVal > 0,
    value2: (newVal, oldVal) => newVal !== oldVal
  }
});
```

In this case, the only difference is that, instead of assigning `true` to any
of these values, we've assigned them "validator functions". A validator in this
sense will be called whenever `setState` updates the component in question.
It will be handed the updated value and the previous value for the state
property and will allow you to determine whether or not your observer
component cares about the update. For example, here we've said that whenever
the Foo class updates its `value1` property, the Bar class is only going to
react to that change only if the updated value is greater than 0.

I keep mentioning that the updated data will be passed to a
`componentTakesState` method. But now let's be a little more specific.

In the previous example, we implemented this method as follows for the
Bar class:

```javascript
componentTakesState(appState, triggerClass, diff) {
  console.log('Redux application state:', appState);
  console.log('Name of class that triggered the action:', triggerClass);
  console.log('Relevant values that changed:', diff);
}
```

Assuming that the Foo class updates its values to 100 and 200 respectively,
this method will produce the following result:

```
Redux application state: { Foo: { ... }, Bar: { ... } }
Name of class that triggered the action: Foo
Relevant values that changed: { value1: 100, value2: 200 }
```

Because both validator functions passed, we end up with both values in our
`diff` object. If only one of them had passed, or if only one value had been
updated on the state, then we would only have gotten that value in our `diff`
object. Pretty simple.

## But I'm a power user. I need more than that.

Fair enough.

By default, when we create validator functions in our `reactsWhen` calls, there
is another implicit check that gets put in place. Specifically, Strux adds a
check to see whether a new value is _different_ from the old value before it
even looks at the validator. So if the value didn't change, the observer won't
pick up the change.

Normally this makes things go a lot faster. But in some cases, it might not
be exactly what you want. If not, you can add a little extra syntax to your
`reactsWhen` calls. For example...

```javascript
Bar.reactsWhen({
  Foo: {
    value1: ['change', newVal => newVal > 0],
    value2: ['always', (newVal, oldVal) => newVal !== oldVal]
  }
});
```

Here, our validators have become arrays. The first item indicates when the
validator should be called and the second item is the validator itself.

As you can see, your 2 options are "change" and "always". If you use "change",
the validator function will only be called when the incoming value is different
from the previous value. If the value hasn't changed, the validator won't be
called and the observer component will not have its `componentTakesState`
function called.

If you use "always", the validator will always be called, even if the new
value and the old value are the same. Note that Strux uses a simple `===`
check to determine whether values have changed. If you need more than that,
you'll have to handle it on your own.

## Why do I have to use a special version of `Component`?

Strux implicitly manages subscriptions and triggers Redux dispatches
within component lifecycle functions. In order to do that, it needs access to
the component's `constructor` function so that it can set those things up.
Strux's version of `Component` doesn't do anything special except extend React's
`Component` to set up a few handlers for lifecycle functions when the component
gets instantiated, and exposes the features we talked about.

It's the simplest possible user experience and, overall, you'll be taking less
of a performance hit than you would if you were to use traditional react-redux
instead.

## Does Strux handle anything asynchronous?

Strux hooks into the asynchronous callback parameter of the `setState` method,
making sure that you never end up with an old copy of a component state by
accident. Beyond that, no. Strux is meant to do one thing well: plug your
components together. So if you're looking for something else, you're on your
own.

## What is the full Strux API?

For the most part, we've already gone through it.

Strux exposes `Component` and `store` from its module. We've already talked
about how `Component` works. And `store` is just your standard, run-of-the-mill
Redux store that Strux is using behind the scenes. You likely won't ever need
it.

## Are there any other considerations to keep in mind?

Yep, here's a list for you:

1. Strux implicitly uses Redux. You will not need to manually import Redux and
create your own store. If you do, your store will not play well with the Strux
store.
2. _Strux implicitly uses Redux._ In other words, react-redux will not play
nicely with Strux. You'll need to pick one or the other.
3. If you call `this.state = ...` inside of a component constructor, Strux will
not consider that initial state as something that should be communicated
across components. It will wait until that initial state starts getting
manipulated before it will start passing data around.
4. Strux is just a layer on top of Redux. You'll need to make sure Redux is
added to your project dependencies as well as Strux.
