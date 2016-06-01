import React, { Component } from 'react';
import Navigation from './navigation';

class Layout extends Component {
  constructor() {
    super();
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
