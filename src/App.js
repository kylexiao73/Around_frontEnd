import React, { Component } from 'react';
import './App.css';
import { Header } from './Header';
import { Register } from "./Register";

class App extends Component {
  render() {
    return (
      <div className="App">
          <Header/>
          <Register/>
      </div>
    );
  }
}

export default App;
