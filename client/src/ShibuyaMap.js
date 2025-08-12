import React, { useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '500px'
};

// 渋谷駅の座標
const shibuyaStation = {
  lat: 35.6580,
  lng: 139.7016
};

// 渋谷駅周辺の主要スポット
const shibuyaSpots = [
  {
    id: 1,
    position: { lat: 35.6598, lng: 139.7006 },
    name: 'ハチ公像',
    description: '渋谷のシンボル的存在'
  },
  {
    id: 2,
    position: { lat: 35.6591, lng: 139.7016 },
    name: 'スクランブル交差点',
    description: '世界で最も有名な交差点'
  },
  {
    id: 3,
    position: { lat: 35.6563, lng: 139.6993 },
    name: 'センター街',
    description: '若者文化の発信地'
  },
  {
    id: 4,
    position: { lat: 35.6614, lng: 139.7006 },
    name: '渋谷スカイ',
    description: '屋上展望台'
  }
];

function ShibuyaMap() {
  const [selectedSpot, setSelectedSpot] = useState(null);

  const onLoad = useCallback((map) => {
    console.log('Map loaded successfully');
  }, []);

  const onUnmount = useCallback((map) => {
    console.log('Map unmounted');
  }, []);

  return (
    <div>
      <h2>渋谷駅周辺マップ</h2>
      <LoadScript
        googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
        language="ja"
        region="JP"
        libraries={['places']}
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={shibuyaStation}
          zoom={16}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          {/* 渋谷駅のマーカー */}
          <Marker
            position={shibuyaStation}
            title="渋谷駅"
            icon={{
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="10" r="8" fill="#FF0000" stroke="white" stroke-width="2"/>
                  <text x="10" y="14" text-anchor="middle" fill="white" font-size="12" font-weight="bold">駅</text>
                </svg>
              `),
              scaledSize: { width: 30, height: 30 }
            }}
          />

          {/* 周辺スポットのマーカー */}
          {shibuyaSpots.map((spot) => (
            <Marker
              key={spot.id}
              position={spot.position}
              title={spot.name}
              onClick={() => setSelectedSpot(spot)}
            />
          ))}

          {/* 選択されたスポットの情報ウィンドウ */}
          {selectedSpot && (
            <InfoWindow
              position={selectedSpot.position}
              onCloseClick={() => setSelectedSpot(null)}
            >
              <div>
                <h3>{selectedSpot.name}</h3>
                <p>{selectedSpot.description}</p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}

export default ShibuyaMap;
