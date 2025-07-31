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

import React, { useEffect, useState } from "react";
import { Provider } from "./components/chakra/provider";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// ページコンポーネント
import { SplashPage } from "./pages/SplashPage";
import { TitlePage } from "./pages/TitlePage";
import { ProloguePage } from "./pages/gamepages/ProloguePage";
import { ActionPage } from "./pages/gamepages/ActionPage";
import { LogPage } from "./pages/gamepages/LogPage";
import { MapPage } from "./pages/gamepages/MapPage";
import { SettingPage } from "./pages/gamepages/SettingPage";
import { EpiloguePage } from "./pages/gamepages/EpiloguePage";
import { ResultPage } from "./pages/ResultPage";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/hello")
      .then((res) => res.json())
      .then((data) => setMessage(data.message));
  }, []);

  return (
    <Provider>
      <Router>
        <Routes>
          <Route path="/" element={<SplashPage />} />
          <Route path="/title" element={<TitlePage />} />
          <Route path="/result" element={<ResultPage />} />
          {/* /game-page内はネストルート */}
          <Route path="/game">
            <Route path="prologue" element={<ProloguePage />} />
            <Route path="action" element={<ActionPage />} />
            <Route path="log" element={<LogPage />} />
            <Route path="map" element={<MapPage />} />
            <Route path="settings" element={<SettingPage />} />
            <Route path="epilogue" element={<EpiloguePage />} />
          </Route>
        </Routes>
        <h1>this from App.js→「{message}」</h1>
      </Router>
    </Provider>
  );
}

export default App;
