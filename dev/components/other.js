import React from 'react';
import { Component } from '../strux/strux';

class Other extends Component {
  constructor() {
    super();
    this.state = {
      className: 'Other',
      testVal1: 1,
      testVal2: 2
    };
    window.otherComponent = this;
  }
  componentDidMount() {
    this.setState({
      testVal1: 100
    });
  }
  render() {
    return (
      <div className="other">
        Other View
      </div>
    );
  }
}

export default Other;
