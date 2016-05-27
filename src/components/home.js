import React from 'react';
import { Component } from '../strux/strux';

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
