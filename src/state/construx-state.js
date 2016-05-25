import { createStore } from '../construx/construx';
import Home from '../components/home';
import Navigation from '../layout/navigation';

function reducer(state = {}, action) {
  switch (action.type) {

    case 'ACTION_TYPE_1':
      console.log('REDUCER:', action);
      return Object.assign({prop: action.prop});

    default:
      return Object.assign({}, state, {});
  }
}

const store = createStore(reducer);

Home
  .dispatches('ACTION_TYPE_1')
  .when('componentDidMount')
  .using((result, home) => {
    console.log('HIT USING:', result, home);
    return { prop: 'val' };
  });

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
