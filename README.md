# Strux

Cross-component communication _finally_ made simple.

## What is Strux?

Strux is designed for React.js. It's a layer on top of Redux that allows
you to describe communication between application components in a revolutionary
way.

## What problem does it solve?

Although Redux has solved a big piece of the spaghetti code problem, it can
still be remarkably difficult to understand the flow of data between
components at a high level. For example, if component A subscribes to an action,
there is no good way within component A to tell where in the world that action
is coming from or what conditions trigger it.

Strux attempts to provde a paradigm wherein cross-component communication
can be fully described in one cohesive place, thus making it extremely easy to
understand which components are dispatching which actions and which components
are picking those up.

## How does it work?

With Strux, you can create a store and write a reducer, just as you
would with Redux. However, you won't need to pass that store around to any
components, you won't need to write any manual `dispatch` calls, and you won't
need to write any manual `subscribe` calls.

Instead you'll write something like this:

```javascript
MyComponent
  .dispatches('MY_ACTION')
  .when('componentDidMount')
  .as(componentState => {
    return { myProperty: componentState.myProperty }
  });

AnotherComponent
  .picksUp('MY_ACTION')
  .then((newState, component) => {
    component.handleStateChange(newState);
  });
```

The call chains shown in this example are called "structs". Each struct
describes how a given component class will dispatch a given Redux action in
response to a specific event with specific data, or how it will respond
to the triggering of a given action and what it will do with the data that
comes through.

Notice that components are no longer subscribing to all state changes as they
would have to with vanilla Redux, but instead they are subscribing only to
specific actions.

## Can I see a full, working example?

Let's start by getting everything Redux-y and Strux-y out of the way first.
We can do that all in one file if we want, but of course we have the option
to break it into separate files as we so choose.

```javascript

// Import createStore from Strux INSTEAD of Redux.
import { createStore } from 'strux';

// Import a couple of components we've created.
import { MyComponent, AnotherComponent } from './components';

// Create a standard, run-of-the-mill reducer.
function reducer(state = {}, action) {
  switch (action.type) {
    case 'MY_ACTION':
      return Object.assign({}, { data: action.data });
    default:
      return state;
  }
}

// Pass our reducer to createStore in order to
// create a store.
createStore(reducer);

// Create a struct describing how MyComponent
// will dispatch 'MY_ACTION'.
MyComponent
  .dispatches('MY_ACTION')
  .when('componentDidMount')
  .as(componentState => {
    return { data: componentState.actionData }
  });

// Create another struct describing how
// AnotherComponent will subscribe to state changes
// triggered by 'MY_ACTION' and what it will do when
// that data comes through.
AnotherComponent
  .picksUp('MY_ACTION')
  .then((newState, component) => {
    component.handleStateChange(newState);
  });

// Notice we don't need to export anything. We just
// need to make sure this file gets executed at some point.
```

Now let's actually define those components we used in our previous
file. We'll create them together as well.

```javascript
// Import React so our JSX will work.
import React from 'react';

// Import Component from Strux INSTEAD of from React.
import { Component } from 'strux';

// Create a standard, run-of-the-mill React component.
export class MyComponent extends Component {
  constructor() {
    super();
    this.state = {
      actionData: 'some data'
    };
  }
  render() {
    return <div>Hi</div>
  }
}

// Create another basic React component.
export class AnotherComponent extends Component {
  constructor() {
    super();
    this.state = {
      receivedData: ''
    };
  }
  handleStateChange(newState) {
    this.setState({
      receivedData: newState.actionData
    });
  }
  render() {
    return <div>{ this.state.receivedData }</div>
  }
}
```

We can see in the above example that there is no cross-component communication
written within the definition for either class. Instead, it is all handled
together in one place.

Here's how it will work based on our structs:

#### From the first struct:

1. An instance of `MyComponent` will mount.
2. A Redux action called 'MY_ACTION' will be dispatched.
3. The body of the action will be created from the state of the component.

#### From the second struct:

1. When an instance of `AnotherComponent` has mounted, it will implicitly subscribe to Redux state changes.
2. Whenever a state change happened because 'MY_ACTION' was dispatched, the `handleStateChange` method will be triggered and handed the new Redux state.

## Why do I have to import `createStore` and `component` from Strux?

In order for Strux to implicitly work with Redux state changes, it needs
a reference to your Redux store. Strux's version of `createStore` doesn't
do anything special except pass your reducer straight into Redux's `createStore`
and then capture a reference to that store to use for itself.

On that note, you actually don't have to use `createStore` if you don't want to.
We're only talking about `createStore` because it's a familiar flow for most
redux users. Strux does provide another way.

But first, let's get to the other part of the question:

In order for Strux to implicitly create subscriptions and trigger dispatches
within component lifecycle functions, it needs access to the component's
`constructor` function in order to set those things up. Strux's version of
`Component` doesn't do anything special except extend React's `Component` to
set up a few handlers for lifecycle functions when the component gets
instantiated.

## How would I use Strux without calling `createStore`?

The `createStore` function is provided as a pass-through to Redux for users
who want to maintain a somewhat familiar flow. However, Strux also provides
an "implicit store" that exists without you having to create it and
allows you to break out your reducer procedures into independent, mini reducers.

Here's how you'd make use of Strux's implicit store:

```javascript
import { implicitStore as store } from 'strux';

store.setInitialState({
  property1: 'value1',
  property2: 'value2'
});

store.reduce('MY_ACTION', (state, action) => something)
     .reduce('ANOTHER_ACTION', (state, action) => something_else)
     .reduce((state, action) => state);

store.getState(); // { ... }
```

Every application using Strux contains a single implicit store object. This
object will allow you to set an initial state (which must take the form of
an object accepting keys and values), create mini reducers, and retrieve a
copy of the current application state.

Notice that you can chain `reduce` calls if you want to. Each function passed to
`reduce` takes a copy of the current state and the dispatched action. Whatever
it returns becomes the new Redux state.

In most cases you'll associate one of these mini reducers with an action name.
Doing this will indicate that your mini reducer should only be called when the
named action is dispatched. If you don't provide that first argument, your
mini reducer will be called whenever a dispatched action doesn't match any
of the actions you've provided a reducer for.

## Getting back to "structs", what are my options for events I can pass to `.when`?

The `.when` method is prepared to accept any lifecycle method native to
React components. Specifically those are:

- `componentDidMount`
- `componentWillUnmount`
- `componentWillMount`
- `componentWillReceiveProps`
- `shouldComponentUpdate`
- `componentWillUpdate`
- `componentDidUpdate`

This, of course, reveals Strux's philosophy that all dispatches should be
triggered within lifecycle functions.

## Does Strux handle anything asynchronous?

In fact, Strux has ajax built in using the native `fetch` API. Here is an
example of a fetch-based struct:

```javascript
MyComponent
  .fetches('/api/v2/users/:id', { headers: ... })
  .when('componentDidMount', state => { return {id: state.userID} })
  .thenDispatches('MY_ACTION')
  .as((data, componentState) => data);
```

Let's walk through the semantics of this function chain.

1. `MyComponent` is set up to fetch a particular URL. Notice that the URL has a variable in it because we may want to fetch a different user at a different time and we'd like to be able to reuse this struct. We can also pass in an object for configuring the ajax call if we want.
2. The fetch occurs when the component has mounted. And when that happens, we use the component's state to return a value for the variable within our URL.
3. When the data comes back, the Redux action `MY_ACTION` is triggered.
4. We'll create the body of the action using the parsed data that was returned as well as the component's state.

## Does Strux contain any other useful tools?

One of the useful tools provided through React Redux is called
`mapStateToProps`. Following the container-vs-presentational
pattern, this function allows you to map a portion of your application state
automatically to props passed down to presentational components.

This doesn't make as much sense when using Strux because Strux eliminates the
need for the container-vs-presentational pattern. Instead, what makes more
sense is the ability to map a portion of the application state directly to the
state of a component. Here's how you'd do that with Strux:

Imagine that your application state looks like this:

```javascript
{
  users: {
    userList: [ ... ],
    activeUser: 1,
    activeUserIsAdmin: true
  },
  profile: {
    name: 'Billy',
    age: 20,
    userID: 1
  }
}
```

Simultaneously, lets imagine that your application contains a `Users`
component and a `Profile` component. So the idea is that we have various
components throughout our application and each one correlates directly with
a sub-object in our greater application state. With this pattern, we can use
Strux's built-in `mapStateToState` function to specify that when a dispatch
occurs and the relevant piece of the application state does not match the
component's state, the differing pieces will be updated on the component state.
Like so:

```javascript
import { mapStateToState } from 'strux';
import { Profile, Users } from './components';

mapStateToState({
  profile: Profile,
  users: Users
});
```

The `mapStateToState` function takes an object wherein each key corresponds
to a key in the application state and each value should be a component in your
application. You are literally mapping the application state to each component
state. Now, whenever an action gets dispatched and a reducer modifies the
`profile` object in our application state, the `Profile` component will
automatically pick that up, diff the changes, and import those changes into
its own state object.

## What is the full Strux API?

Strux is simply a layer sitting on top of Redux. As such, you can import Strux
_instead of_ Redux and Strux will import Redux as a dependency, passing the full
Redux API on to you. You can use it to call `createStore`, `combineReducers`,
and all other Redux functions. Aside from this, Strux gives you a new version
of React's `Component`.

Within Strux's version of `Component`, you can call 3 new static methods, all
of which have been described here. They are:

- `Component.dispatches`
- `Component.fetches`
- `Component.picksUp`

Strux also provides the implicit store. Its methods are as follows:

- `implicitStore.reduce(String actionType, Function procedure)` - Whenever `actionType` is dispatched, `procedure` will be used as the reducer. Returns `implicitStore`.
- `implicitStore.getStore()` - Returns the Redux store.
- `implicitStore.getState()` - Gets a copy of the current application state.
- `implicitStore.setInitialState(Object initState)` - Can only be called once. Allows you to use `initState` as the initial form of the application state. Returns a copy of the application state after being set.

Lastly, we have `mapStateToState`:

- `mapStateToState(Object mappings)` - Allows you to denote which keys on the application state should map to state objects on individual component classes. Returns undefined.

## What are the bigger implications?

Using Strux completely removes the need for writing React applications using
the "container vs presentational" pattern. There is no need for classes such as
React Redux's `Provider` because no state change data needs to be passed from
parent to child.

**As such, Strux is built on Redux proper and uses Redux as a dependency, NOT React Redux.**

We'll also never need to awkwardly spread ajax calls all over the application either.
Because Strux wants you to tie Redux actions to all ajax calls, it simply
becomes another source of cross-component communication.
