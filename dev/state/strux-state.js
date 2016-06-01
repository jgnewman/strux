import { createStore, implicitStore, mapStateToState } from '../strux/strux';
import Home from '../components/home';
import Other from '../components/other';
import Navigation from '../layout/navigation';

// function reducer(state = {}, action) {
//   switch (action.type) {
//
//     case 'ACTION_TYPE_1':
//       console.log('REDUCER ACTION_TYPE_1:', action);
//       return Object.assign({prop: action.prop});
//
//     case 'ACTION_TYPE_2':
//       console.log('REDUCER, ACTION_TYPE_2:', action);
//       return Object.assign({data: action.data});
//
//     default:
//       return Object.assign({}, state, {});
//   }
// }
//
// const store = createStore(reducer);

implicitStore.setInitialState({
  home: {},
  other: {},
  navigation: {}
});

mapStateToState({
  home: Home,
  other: Other,
  navigation: Navigation
});

implicitStore
  .reduce('HOME_ACTION', (state, action) => {
    console.log('Reducing HOME_ACTION:', action);
    const newHome = Object.assign({}, state.home, { homeProp: action.homeProp });
    return Object.assign({}, state, { home: newHome });
  })
  .reduce('FETCH_ACTION', (state, action) => {
    console.log('Reducing FETCH_ACTION:', action);
    return state;
  })
  .reduce((state, action) => {
    return state;
  });

Home
  .dispatches('HOME_ACTION')
  .when('componentDidMount')
  .as(state => {
    console.log('Home is dispatching HOME_ACTION');
    return { homeProp: 'homeVal' };
  });

Home
  .fetches('./:file')
  .when('componentDidMount', state => { return {file: 'package'} })
  .thenDispatches('FETCH_ACTION')
  .as(data => {
    console.log('Result of fetch was:', data)
    return {data: data}
  })

// dispatchFrom(Home)
//   .type('ACTION_TYPE_1')
//   .when('compnentDidMount')
//   .using(() => { prop: val })

Navigation
  .picksUp('HOME_ACTION')
  .then((appState, navigation) => {
    console.log('Navigation picked up HOME_ACTION with:', appState, navigation);
  });


export default implicitStore.getStore();
