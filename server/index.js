// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/hello', (req, res) => {
  console.log("GET /api/hello accessed");
  res.json({ message: 'Hello from backend!' });
});

// Google Maps API Test Endpoints

// 1. Geocoding API - 住所を緯度経度に変換
app.get('/api/maps/geocode', async (req, res) => {
  console.log('🔍 Geocoding API called:', req.query);
  try {
    const { address } = req.query;
    
    if (!address) {
      console.log('❌ No address provided');
      return res.status(400).json({ error: 'Address parameter is required' });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.log('❌ No API key configured');
      return res.status(500).json({ error: 'Google Maps API key not configured' });
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: address,
        key: apiKey
      }
    });

    console.log('✅ Geocoding request for address:', address);
    console.log('📊 Response status:', response.data.status);
    console.log('📄 Full response data:', JSON.stringify(response.data, null, 2));
    res.json(response.data);
  } catch (error) {
    console.error('❌ Geocoding error:', error.message);
    if (error.response) {
      console.error('📄 Response data:', error.response.data);
    }
    res.status(500).json({ error: 'Failed to geocode address' });
  }
});

// 2. Places API - 周辺スポット検索
app.get('/api/maps/places/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 1500, type } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude parameters are required' });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Google Maps API key not configured' });
    }

    const params = {
      location: `${lat},${lng}`,
      radius: radius,
      key: apiKey
    };

    if (type) {
      params.type = type;
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
      params: params
    });

    console.log(`Places search request for location: ${lat},${lng}, radius: ${radius}, type: ${type || 'all'}`);
    res.json(response.data);
  } catch (error) {
    console.error('Places search error:', error.message);
    res.status(500).json({ error: 'Failed to search places' });
  }
});

// 3. Directions API - ルート検索
app.get('/api/maps/directions', async (req, res) => {
  try {
    const { origin, destination, mode = 'driving' } = req.query;
    
    if (!origin || !destination) {
      return res.status(400).json({ error: 'Origin and destination parameters are required' });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Google Maps API key not configured' });
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
      params: {
        origin: origin,
        destination: destination,
        mode: mode,
        key: apiKey
      }
    });

    console.log(`Directions request from ${origin} to ${destination}, mode: ${mode}`);
    res.json(response.data);
  } catch (error) {
    console.error('Directions error:', error.message);
    res.status(500).json({ error: 'Failed to get directions' });
  }
});

// 4. API設定状況確認
app.get('/api/maps/status', (req, res) => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  res.json({ 
    apiKeyConfigured: !!apiKey,
    apiKeyPreview: apiKey ? `${apiKey.substring(0, 10)}...` : null
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  console.log(`Google Maps API Key configured: ${!!process.env.GOOGLE_MAPS_API_KEY}`);
});
