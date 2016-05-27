import { createStore } from '../construx/construx';
import Home from '../components/home';
import Navigation from '../layout/navigation';

function reducer(state = {}, action) {
  switch (action.type) {

    case 'ACTION_TYPE_1':
      console.log('REDUCER ACTION_TYPE_1:', action);
      return Object.assign({prop: action.prop});

    case 'ACTION_TYPE_2':
      console.log('REDUCER, ACTION_TYPE_2:', action);
      return Object.assign({data: action.data});

    default:
      return Object.assign({}, state, {});
  }
}

const store = createStore(reducer);

Home
  .dispatches('ACTION_TYPE_1')
  .when('componentDidMount')
  .as(state => {
    console.log('HIT USING:', state);
    return { prop: 'val' };
  });

Home
  .fetches('./:file')
  .when('componentDidMount', state => { return {file: 'package'} })
  .thenDispatches('ACTION_TYPE_2')
  .as(data => {
    console.log('describer got', data)
    return {data: data}
  })

// dispatchFrom(Home)
//   .type('ACTION_TYPE_1')
//   .when('compnentDidMount')
//   .using(() => { prop: val })

Navigation
  .picksUp('ACTION_TYPE_1')
  .then((appState, nav) => {
    console.log('HIT THEN:', appState, nav);
    nav.setState(appState);
  });


export default store;
