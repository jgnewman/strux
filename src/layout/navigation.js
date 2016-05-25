import React from 'react';
import { Component } from '../construx/construx';
import { Link } from 'react-router';

class Navigation extends Component {
  constructor() {
    super();
  }
  render() {
    return (
      <div className="navigation">
        Navigation
        <ul>
          <li>
            <Link to="/" activeClassName="active">Home</Link>
          </li>
          <li>
            <Link to="/other" activeClassName="active">Other</Link>
          </li>
        </ul>
      </div>
    );
  }
}

export default Navigation;
