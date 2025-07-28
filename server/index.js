// server/index.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.get('/api/hello', (req, res) => {
  console.log("GET /api/hello accessed");
  res.json({ message: 'Hello from backend!' });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
