import React, { Component } from 'react';
import Navigation from './navigation';

class Layout extends Component {
  constructor() {
    super();
    this.state = {
      className: 'Navigation',
      testVala: 'a',
      testValb: 'b'
    };
    window.navComponent = this;
  }
  render() {
    return (
      <div className="layout">
        <Navigation />
        {this.props.children}
      </div>
    );
  }
}

export default Layout;
