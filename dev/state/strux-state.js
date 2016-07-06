import { createStore, implicitStore, mapStateToState } from '../strux/strux';
import Home from '../components/home';
import Other from '../components/other';
import Navigation from '../layout/navigation';

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
  .reduce('HOMEX', (state, action) => {
    console.log('Reducing HOMEX:', action);
    const newHome = Object.assign({}, state.home, { sup: action.sup });
    return Object.assign({}, state, { home: newHome });
  })
  .reduce('FETCH_ACTION', (state, action) => {
    console.log('Reducing FETCH_ACTION:', action);
    return state;
  })
  .reduce((state, action) => {
    console.log('got default reducer', action);
    return state;
  });

window.store = implicitStore.getStore();

Home
  .dispatches('HOME_ACTION')
  .when('componentDidMount')
  .as(state => {
    console.log('Home is dispatching HOME_ACTION');
    return { homeProp: 'homeVal' };
  });

Home
  .dispatches('CUSTOM_HOME_ACTION')
  .when('customEvent')
  .as(state => {
    console.log('Home is dispatching CUSTOM_HOME_ACTION');
    return { homeProp2: 'homeVal2' };
  });

Home
  .picksUp('HOMEX')
  .then((appState, home) => {
    console.log('Home picked up', appState, home);
  });

Home
  .fetches('./:file')
  .when('componentDidMount', state => { return {file: 'package'} })
  .thenDispatches('FETCH_ACTION')
  .as(data => {
    console.log('Result of fetch was:', data)
    return {data: data}
  });

Navigation
  .picksUp('HOME_ACTION')
  .then((appState, navigation) => {
    console.log('Navigation picked up HOME_ACTION with:', appState, navigation);
  });


export default implicitStore.getStore();
