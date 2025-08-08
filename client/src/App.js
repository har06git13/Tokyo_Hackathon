import React, { useEffect, useState } from "react";
import { Provider } from "./components/chakra/provider";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./styleguide.css";

// ページコンポーネント
import { TitlePage, ProfilePage, SplashPage } from "./pages/title-pages";
import {
  ProloguePage,
  ActionPage,
  LogPage,
  MapPage,
  EpiloguePage,
  WalkPage,
  CheckInPage,
  SnsPage,
} from "./pages/game-pages";
import {
  SettingPage,
  RuleInfoPage,
  SpotTypeInfoPage,
  LifeGaugeInfoPage,
} from "./pages/game-pages/setting-pages";
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
          <Route path="/title">
            <Route path="gamestart" element={<TitlePage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          <Route path="/result" element={<ResultPage />} />
          {/* /game-page内はネストルート */}
          <Route path="/game">
            <Route path="prologue" element={<ProloguePage />} />
            <Route path="action" element={<ActionPage />} />
            <Route path="log" element={<LogPage />} />
            <Route path="map" element={<MapPage />} />
            <Route path="epilogue" element={<EpiloguePage />} />
            <Route path="walk" element={<WalkPage />} />
            <Route path="checkin" element={<CheckInPage />} />
            <Route path="sns" element={<SnsPage />} />
            <Route path="setting" element={<SettingPage />} />
            <Route
              path="setting/lifegaugeinfo"
              element={<LifeGaugeInfoPage />}
            />
            <Route path="setting/ruleinfo" element={<RuleInfoPage />} />
            <Route path="setting/spottypeinfo" element={<SpotTypeInfoPage />} />
          </Route>
        </Routes>
        {/* <h1>this from App.js→「{message}」</h1> */}
      </Router>
    </Provider>
  );
}

export default App;
