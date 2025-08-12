import React, { useState } from 'react';

const QRCodeGenerator = () => {
  const [inputText, setInputText] = useState('https://example.com');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const generateQRCode = () => {
    // QR Server API を使用してQRコードを生成
    const encodedText = encodeURIComponent(inputText);
    const size = '200x200';
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}&data=${encodedText}`;
    setQrCodeUrl(qrUrl);
  };

  const sampleTexts = [
    'https://github.com/har06git13/Tokyo_Hackathon',
    'Hello World from Tokyo Hackathon!',
    '{"name": "Tokyo Hackathon", "year": 2025}',
    'geo:35.6762,139.6503',
    'tel:+81-3-1234-5678',
    'mailto:test@example.com'
  ];

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '600px', 
      margin: '20px auto',
      border: '1px solid #ddd',
      borderRadius: '10px',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>QRコードテスト用ジェネレーター</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          テスト用テキスト:
        </label>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            fontSize: '14px'
          }}
          placeholder="QRコードにしたいテキストを入力..."
        />
      </div>

      <div style={{ marginBottom: '15px' }}>
        <button
          onClick={generateQRCode}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          QRコード生成
        </button>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <strong>サンプルテキスト（クリックで使用）:</strong>
        <div style={{ marginTop: '10px' }}>
          {sampleTexts.map((text, index) => (
            <button
              key={index}
              onClick={() => setInputText(text)}
              style={{
                display: 'block',
                width: '100%',
                margin: '5px 0',
                padding: '8px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '12px',
                textAlign: 'left'
              }}
            >
              {text}
            </button>
          ))}
        </div>
      </div>

      {qrCodeUrl && (
        <div style={{
          textAlign: 'center',
          padding: '15px',
          backgroundColor: 'white',
          borderRadius: '10px',
          border: '2px solid #007bff'
        }}>
          <h4>生成されたQRコード:</h4>
          <img 
            src={qrCodeUrl} 
            alt="Generated QR Code"
            style={{
              maxWidth: '200px',
              height: 'auto',
              border: '1px solid #ddd'
            }}
          />
          <p style={{ 
            fontSize: '12px', 
            color: '#666', 
            marginTop: '10px',
            wordBreak: 'break-all'
          }}>
            内容: {inputText}
          </p>
          <p style={{ fontSize: '12px', color: '#999' }}>
            上のQRコードをスキャナーでテストしてください
          </p>
        </div>
      )}

      <div style={{
        fontSize: '12px',
        color: '#666',
        marginTop: '15px',
        padding: '10px',
        backgroundColor: '#e9ecef',
        borderRadius: '5px'
      }}>
        <strong>使用方法:</strong>
        <ol style={{ margin: '5px 0', paddingLeft: '20px' }}>
          <li>テキストを入力または サンプルテキストを選択</li>
          <li>「QRコード生成」ボタンをクリック</li>
          <li>生成されたQRコードを上のスキャナーでテスト</li>
        </ol>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
