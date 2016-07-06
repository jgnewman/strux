import React from 'react';
import { Component } from '../strux/strux';

class Home extends Component {
  constructor() {
    super();
    this.state = {sup: 'hi'};
    window.homeComponent = this;
    setTimeout(() => {
      this.customEvent();
    }, 3000);
  }
  customEvent() {
    console.log('---custom running');
    return 4;
  }
  render() {
    return (
      <div className="home">
        {this.state.sup} this is the Home View
      </div>
    );
  }
}

export default Home;
