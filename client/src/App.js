import React, { useEffect, useState } from "react";
import { Provider } from "./components/chakra/provider";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Flex, Box } from "@chakra-ui/react";
import "./styleguide.css";

// ページコンポーネント
import {
  TitlePage,
  ProfilePage,
  SplashPage,
  NotFoundPage,
} from "./pages/title-pages";
import {
  ActionPage,
  LogPage,
  MapPage,
  WalkPage,
  CheckInPage,
  SnsPage,
  MonologuePage,
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
  const BASE_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetch(`${BASE_URL}/api/hello`)
      .then((res) => res.json())
      .then((data) => setMessage(data.message));
  }, []);

  console.log("API URL:", process.env.REACT_APP_API_URL);

  return (
    <Provider>
      <Flex
        width="100vw"
        height="100vh"
        alignItems="center"
        justifyContent="center"
        position="relative"
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          width="100%"
          height="100%"
          backgroundImage="url('/assets/image/monologue-back.png')"
          backgroundSize="contain"
          backgroundPosition="center"
          zIndex={-1} // 背景として下に置く
          filter="brightness(1.2) contrast(0.9) blur(0.6vh) opacity(0.4)"
        />

        <div
          className="outer-wrapper"
          style={{ position: "relative", zIndex: 0 }}
        >
          <Router>
            <Routes>
              <Route path="/" element={<SplashPage />} />
              <Route path="/title">
                <Route path="gamestart" element={<TitlePage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>
              <Route path="/result" element={<ResultPage />} />
              <Route path="/game">
                <Route path="monologue/:eventId" element={<MonologuePage />} />
                <Route path="action" element={<ActionPage />} />
                <Route path="log" element={<LogPage />} />
                <Route path="map" element={<MapPage />} />
                <Route path="walk" element={<WalkPage />} />
                <Route path="checkin" element={<CheckInPage />} />
                <Route path="sns" element={<SnsPage />} />
                <Route path="setting" element={<SettingPage />} />
                <Route
                  path="setting/lifegaugeinfo"
                  element={<LifeGaugeInfoPage />}
                />
                <Route path="setting/ruleinfo" element={<RuleInfoPage />} />
                <Route
                  path="setting/spottypeinfo"
                  element={<SpotTypeInfoPage />}
                />
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Router>
        </div>
      </Flex>
    </Provider>
  );
}

export default App;
