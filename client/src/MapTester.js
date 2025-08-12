import React, { useState } from 'react';

function MapTester() {
  const [testResult, setTestResult] = useState('テストを選択してください');
  const [isLoading, setIsLoading] = useState(false);

  // ------ ヘルパー ------
  const checkMapLoadStatus = () => ({
    googleMapsLoaded: typeof window.google !== 'undefined',
    mapsAPILoaded: typeof window.google?.maps !== 'undefined',
    geocoderAvailable: typeof window.google?.maps?.Geocoder !== 'undefined',
    placesAvailable: typeof window.google?.maps?.places !== 'undefined',
    directionsAvailable: typeof window.google?.maps?.DirectionsService !== 'undefined',
    streetViewAvailable: typeof window.google?.maps?.StreetViewService !== 'undefined',
    apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY ? '設定済み' : '未設定'
  });

  const getDayOfWeek = (date) => {
    const days = ['日','月','火','水','木','金','土'];
    return days[date.getDay()];
  };

  // ------ 基本テスト ------
  const testGoogleMapsAPI = async () => {
    setIsLoading(true); setTestResult('Geocodingテスト中...');
    try {
      if (typeof window.google === 'undefined') throw new Error('Google Maps未ロード');
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: '渋谷駅', region: 'JP' }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const loc = results[0].geometry.location;
            setTestResult(`✅ 渋谷駅 座標取得成功\n緯度: ${loc.lat().toFixed(6)}\n経度: ${loc.lng().toFixed(6)}\n住所: ${results[0].formatted_address}`);
        } else {
          setTestResult(`❌ Geocoding失敗: ${status}`);
        }
        setIsLoading(false);
      });
    } catch (e) { setTestResult(`❌ エラー: ${e.message}`); setIsLoading(false);}  
  };

  const testReverseGeocoding = async () => {
    setIsLoading(true); setTestResult('逆Geocoding中...');
    try {
      if (typeof window.google === 'undefined') throw new Error('Google Maps未ロード');
      const geocoder = new window.google.maps.Geocoder();
      const latlng = { lat: 35.6580, lng: 139.7016 };
      geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === 'OK' && results[0]) {
          setTestResult(`✅ 逆Geocoding成功\n座標: ${latlng.lat}, ${latlng.lng}\n住所: ${results[0].formatted_address}`);
        } else setTestResult(`❌ 逆Geocoding失敗: ${status}`);
        setIsLoading(false);
      });
    } catch(e){ setTestResult(`❌ エラー: ${e.message}`); setIsLoading(false);}  
  };

  // ------ Places ------
  const testPlacesSearch = async () => {
    setIsLoading(true); setTestResult('Places検索中...');
    try {
      if (typeof window.google === 'undefined') throw new Error('Google Maps未ロード');
      if (typeof window.google?.maps?.places === 'undefined') throw new Error('Placesライブラリ未ロード');
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      const baseLoc = new window.google.maps.LatLng(35.6580,139.7016);
      const types = [
        { type:'restaurant', label:'レストラン' },
        { type:'store', label:'店舗' },
        { type:'tourist_attraction', label:'観光地' }
      ];
      const results = [];
      await Promise.all(types.map(t => new Promise(resolve => {
        service.nearbySearch({ location: baseLoc, radius: 500, type: t.type }, (res,status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && res.length){
            results.push(`✅ ${t.label} (${res.length}件)\n${res.slice(0,3).map(p=>` • ${p.name}(${p.rating||'NR'})`).join('\n')}`);
          } else {
            results.push(`❌ ${t.label}: ${status}`);
          }
          resolve();
        });
      })));
      setTestResult(`🔍 渋谷駅周辺 Places結果\n\n${results.join('\n\n')}\n\n半径:500m`);
    } catch(e){ setTestResult(`❌ Placesエラー: ${e.message}`);} finally { setIsLoading(false);} 
  };

  // ------ Directions (徒歩のみ) ------
  const testDirections = async () => {
    setIsLoading(true); setTestResult('徒歩ルート検索中...');
    try {
      if (typeof window.google === 'undefined') throw new Error('Google Maps未ロード');
      const svc = new window.google.maps.DirectionsService();
      
      const request = {
        origin: '渋谷駅',
        destination: '新宿駅',
        travelMode: window.google.maps.TravelMode.WALKING
      };

      const result = await new Promise(resolve => {
        svc.route(request, (res,status) => resolve({res,status}));
      });
      
      if (result.status === 'OK' && result.res.routes.length){
        const leg = result.res.routes[0].legs[0];
        setTestResult(`✅ 徒歩ルート検索成功: 渋谷駅 → 新宿駅
        
距離: ${leg.distance.text}
時間: ${leg.duration.text}
出発地: ${leg.start_address}
到着地: ${leg.end_address}`);
      } else {
        setTestResult(`❌ 徒歩ルート検索失敗: ${result.status}`);
      }
    } catch(e){ setTestResult(`❌ ルート検索エラー: ${e.message}`);} finally { setIsLoading(false);} 
  };

  // ------ Street View ------
  const testStreetView = async () => {
    setIsLoading(true); setTestResult('StreetView取得中...');
    try {
      if (typeof window.google === 'undefined') throw new Error('Google Maps未ロード');
      const svc = new window.google.maps.StreetViewService();
      svc.getPanorama({ location:{ lat:35.6580, lng:139.7016 }, radius:50 }, (data,status)=>{
        if (status==='OK') {
          setTestResult(`✅ StreetView取得成功\nPanoID: ${data.location.pano}\n撮影日: ${data.imageDate || '不明'}`);
        } else setTestResult(`❌ StreetView失敗: ${status}`);
        setIsLoading(false);
      });
    } catch(e){ setTestResult(`❌ StreetViewエラー: ${e.message}`); setIsLoading(false);} 
  };

  // ------ バックエンド連携 ------
  const testBackendAPI = async () => {
    setIsLoading(true); setTestResult('バックエンド総合テスト中...');
    try {
      const [g,p,d] = await Promise.all([
        fetch('/api/maps/geocode?address=渋谷駅').then(r=>r.json()),
        fetch('/api/maps/places/nearby?lat=35.6580&lng=139.7016&radius=300&type=restaurant').then(r=>r.json()),
        fetch('/api/maps/directions?origin=渋谷駅&destination=新宿駅&mode=walking').then(r=>r.json())
      ]);
      setTestResult(`🔗 バックエンドAPI結果\nGeocoding: ${g.status || g.error}\nPlaces: ${p.status || p.error}\nDirections: ${d.status || d.error}`);
    } catch(e){ setTestResult(`❌ バックエンド連携エラー: ${e.message}`);} finally { setIsLoading(false);} 
  };

  // ------ API状態表示 ------
  const showApiStatus = () => {
    const s = checkMapLoadStatus();
    setTestResult(`📊 APIロード状態\nGoogleオブジェクト: ${s.googleMapsLoaded?'✅':'❌'}\nMaps: ${s.mapsAPILoaded?'✅':'❌'}\nGeocoder: ${s.geocoderAvailable?'✅':'❌'}\nPlaces: ${s.placesAvailable?'✅':'❌'}\nDirections: ${s.directionsAvailable?'✅':'❌'}\nStreetView: ${s.streetViewAvailable?'✅':'❌'}\nAPIキー: ${s.apiKey}`);
  };

  // ------ UI ------
  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #ccc', 
      margin: '20px 0',
      borderRadius: '8px',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>🧪 Google Maps API 総合テスター</h3>
      <p>渋谷駅周辺の地図機能をテストします</p>
      
      {/* 基本機能テスト */}
      <div style={{ marginBottom: '15px' }}>
        <h4>📋 基本機能テスト</h4>
        <div style={{ marginBottom: '10px' }}>
          <button 
            onClick={showApiStatus}
            style={{
              padding: '8px 16px',
              marginRight: '8px',
              marginBottom: '8px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            API状況確認
          </button>
          
          <button 
            onClick={testGoogleMapsAPI}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              marginRight: '8px',
              marginBottom: '8px',
              backgroundColor: isLoading ? '#6c757d' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            Geocoding
          </button>

          <button 
            onClick={testReverseGeocoding}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              marginRight: '8px',
              marginBottom: '8px',
              backgroundColor: isLoading ? '#6c757d' : '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            逆Geocoding
          </button>
        </div>
      </div>

      {/* 高度な機能テスト */}
      <div style={{ marginBottom: '15px' }}>
        <h4>🚀 高度な機能テスト</h4>
        <div style={{ marginBottom: '10px' }}>
          <button 
            onClick={testPlacesSearch}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              marginRight: '8px',
              marginBottom: '8px',
              backgroundColor: isLoading ? '#6c757d' : '#fd7e14',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            Places検索
          </button>

          <button 
            onClick={testDirections}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              marginRight: '8px',
              marginBottom: '8px',
              backgroundColor: isLoading ? '#6c757d' : '#6f42c1',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            徒歩ルート検索
          </button>

          <button 
            onClick={testStreetView}
            disabled={isLoading}
            style={{
              padding: '8px 16px',
              marginRight: '8px',
              marginBottom: '8px',
              backgroundColor: isLoading ? '#6c757d' : '#e83e8c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            ストリートビュー
          </button>
        </div>
      </div>

      {/* バックエンド連携テスト */}
      <div style={{ marginBottom: '15px' }}>
        <h4>🔗 バックエンド連携テスト</h4>
        <button 
          onClick={testBackendAPI}
          disabled={isLoading}
          style={{
            padding: '8px 16px',
            backgroundColor: isLoading ? '#6c757d' : '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          {isLoading ? 'テスト中...' : 'バックエンドAPI総合テスト'}
        </button>
      </div>

      {/* 結果表示 */}
      {testResult && (
        <div style={{ marginTop: '15px' }}>
          <h4>📊 テスト結果</h4>
          <pre style={{
            backgroundColor: '#e9ecef',
            padding: '15px',
            borderRadius: '4px',
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            fontSize: '13px',
            maxHeight: '400px',
            overflow: 'auto',
            border: '1px solid #dee2e6'
          }}>
            {testResult}
          </pre>
        </div>
      )}
    </div>
  );
}

export default MapTester;
