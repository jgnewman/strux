import React from 'react';
import { Component } from '../strux/strux';

class Home extends Component {
  constructor() {
    super();
    this.state = {
      className: 'Home',
      testVal1: 100,
      testVal2: 200
    };
    window.homeComponent = this;
  }
  componentDidMount() {
    // Navigation should call componentTakesState and get 2 values in the diff.
    this.setState({
      testVal1: 15,
      testVal2: 3
    });
    // Navigation should call componentTakesState and get 1 value in the diff.
    setTimeout(() => {
      this.setState({
        testVal1: 5,
        testVal2: 2
      });
    });
  }
  render() {
    return (
      <div className="home">
        {this.state.testVal1} this is the Home View
      </div>
    );
  }
}

export default Home;
