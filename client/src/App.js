/*
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
*/


import React, { useEffect, useState } from 'react';
import ShibuyaMap from './ShibuyaMap';
import MapTester from './MapTester';
import QRCodeScanner from './QRCodeScanner';
import QRCodeGenerator from './QRCodeGenerator';
import './App.css';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/hello')
      .then((res) => res.json())
      .then((data) => setMessage(data.message));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Tokyo Hackathon - Map Demo</h1>
        <p>バックエンドからのメッセージ: {message}</p>
      </header>
      
      <main style={{ padding: '20px' }}>
        <QRCodeScanner />
        <QRCodeGenerator />
        <MapTester />
        <ShibuyaMap />
      </main>
    </div>
  );
}

export default App;
