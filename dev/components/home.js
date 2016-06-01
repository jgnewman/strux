import React from 'react';
import { Component } from '../strux/strux';

class Home extends Component {
  constructor() {
    super();
    this.state = {sup: 'hi'};
    window.homeComponent = this;
  }
  render() {
    console.log('rendering home')
    return (
      <div className="home">
        Home View
      </div>
    );
  }
}

export default Home;
