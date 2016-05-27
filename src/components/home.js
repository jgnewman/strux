import React from 'react';
import { Component } from '../construx/construx';

class Home extends Component {
  constructor() {
    super();
    this.state = {sup: 'hi'};
  }
  render() {
    return (
      <div className="home">
        Home View
      </div>
    );
  }
}

export default Home;
