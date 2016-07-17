import Home from '../components/home';
import Other from '../components/other';
import Navigation from '../layout/navigation';
import { store } from '../strux/strux';

window.store = store;

Navigation.reactsWhen({
  Home: {
    testVal1: newVal => newVal > 10,
    testVal2: (newVal, oldVal) => newVal !== oldVal
  },
  Other: {
    testVal1: true
  }
});
