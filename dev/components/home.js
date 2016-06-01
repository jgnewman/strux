import React from 'react';
import { Component } from '../strux/strux';

class Home extends Component {
  constructor() {
    super();
    this.state = {sup: 'hi'};
    window.homeComponent = this;
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
