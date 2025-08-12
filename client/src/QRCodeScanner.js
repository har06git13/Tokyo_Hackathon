import React, { useRef, useEffect, useState } from 'react';
import QrScanner from 'qr-scanner';

const QRCodeScanner = () => {
  const videoRef = useRef(null);
  const [qrResult, setQrResult] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState('');
  const qrScannerRef = useRef(null);

  useEffect(() => {
    return () => {
      // クリーンアップ：コンポーネントがアンマウントされる時にスキャナーを停止
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      setError('');
      setIsScanning(true);

      // カメラ権限をチェック
      const hasCamera = await QrScanner.hasCamera();
      if (!hasCamera) {
        throw new Error('カメラが見つかりません');
      }

      // QRスキャナーを初期化
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          setQrResult(result.data);
          console.log('QRコードが検出されました:', result.data);
        },
        {
          onDecodeError: (error) => {
            // QRコードが見つからない場合のエラーは無視
            console.log('Decode error:', error);
          },
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      await qrScannerRef.current.start();
      console.log('QRスキャナーが開始されました');

    } catch (err) {
      console.error('スキャン開始エラー:', err);
      setError(`スキャンを開始できませんでした: ${err.message}`);
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current = null;
    }
    setIsScanning(false);
  };

  const clearResult = () => {
    setQrResult('');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>QRコードスキャナー テスト</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={startScanning} 
          disabled={isScanning}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: isScanning ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isScanning ? 'not-allowed' : 'pointer'
          }}
        >
          {isScanning ? 'スキャン中...' : 'スキャン開始'}
        </button>
        
        <button 
          onClick={stopScanning} 
          disabled={!isScanning}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: !isScanning ? '#ccc' : '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: !isScanning ? 'not-allowed' : 'pointer'
          }}
        >
          スキャン停止
        </button>

        <button 
          onClick={clearResult}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          結果クリア
        </button>
      </div>

      {error && (
        <div style={{
          padding: '10px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          エラー: {error}
        </div>
      )}

      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <video
          ref={videoRef}
          style={{
            width: '100%',
            maxWidth: '400px',
            height: 'auto',
            border: '2px solid #ddd',
            borderRadius: '10px'
          }}
          playsInline
        />
        {isScanning && (
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            backgroundColor: 'rgba(0, 123, 255, 0.8)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '5px',
            fontSize: '12px'
          }}>
            QRコードをカメラに向けてください
          </div>
        )}
      </div>

      {qrResult && (
        <div style={{
          padding: '15px',
          backgroundColor: '#d4edda',
          color: '#155724',
          border: '1px solid #c3e6cb',
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          <h4>読み取り結果:</h4>
          <p style={{ wordBreak: 'break-all', margin: '5px 0' }}>{qrResult}</p>
          
          {/* URLの場合はリンクとして表示 */}
          {qrResult.startsWith('http') && (
            <a 
              href={qrResult} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#007bff', textDecoration: 'underline' }}
            >
              リンクを開く
            </a>
          )}
        </div>
      )}

      <div style={{
        fontSize: '14px',
        color: '#666',
        backgroundColor: '#f8f9fa',
        padding: '15px',
        borderRadius: '5px'
      }}>
        <h4>使用方法:</h4>
        <ul>
          <li>「スキャン開始」ボタンを押してカメラを起動</li>
          <li>QRコードをカメラに向ける</li>
          <li>自動的にQRコードが検出され、結果が表示されます</li>
          <li>テスト用QRコードを生成したい場合は、オンラインのQRコード生成サイトを利用してください</li>
        </ul>
      </div>
    </div>
  );
};

export default QRCodeScanner;
