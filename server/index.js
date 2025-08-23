// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI not set in .env');
  process.exit(1);
}

const client = new MongoClient(uri);
let db, Users, Events, Facilities, SnsPosts;

async function start() {
  // MongoDB 接続
  await client.connect();
  db = client.db(process.env.DB_NAME || 'tokyo_hackathon_dev');
  Users = db.collection('users');
  Events = db.collection('events');
  Facilities = db.collection('facilities');
  SnsPosts = db.collection('sns');


  app.listen(PORT, () =>
    console.log(`Server listening on http://localhost:${PORT}`)
  );
  console.log('✅ MongoDB connected');
}
start().catch(err => {
  console.error('Mongo connect error:', err);
  process.exit(1);
});

/* --- 既存の動作確認用エンドポイント --- */
app.get('/api/hello', (req, res) => {
  console.log('GET /api/hello accessed');
  res.json({ message: 'Hello from backend!' });
});
app.get('/api/health', (_req, res) => res.json({ ok: true }));


// ユーザー作成
app.post('/api/users', async (req, res, next) => {
  try {
    const user = {
      name: req.body.name,
      age: req.body.age,
      gender: req.body.gender,
      shibuya_relation: req.body.shibuya_relation,
      icon: req.body.icon,
      hp_log: req.body.hp_log || [],
      visited_list: req.body.visited_list || [],
      event_list: req.body.event_list || []
    };
    const r = await Users.insertOne(user);
    res.json({ _id: r.insertedId, ...user });
  } catch (e) { next(e); }
});


// 施設一覧
app.get('/api/facilities', async (_req, res, next) => {
  try {
    const list = await Facilities.find({}).toArray();
    res.json(list);
  } catch (e) { next(e); }
});


// イベント検索（type / timeSlot / locationId で絞り込み）
app.get('/api/events', async (req, res, next) => {
  try {
    const q = {};
    if (req.query.type) q.type = req.query.type;
    if (req.query.timeSlot) q.timeSlot = req.query.timeSlot;
    if (req.query.locationId) q.locationId = req.query.locationId;
    const list = await Events.find(q).toArray();
    res.json(list);
  } catch (e) { next(e); }
});


// イベントの取得
app.get('/api/events/:id', async (req, res, next) => {
  try {
    const ev = await Events.findOne({ _id: req.params.id });
    if (!ev) return res.status(404).json({ error: 'Event not found' });
    res.json(ev); // _id を含むそのまま返す
  } catch (e) { next(e); }
});

/* --- SNS --- */
// 時間帯での取得（例: /api/sns?timeSlot=2h）
app.get('/api/sns', async (req, res, next) => {
  try {
    const { timeSlot } = req.query;
    const filter = timeSlot ? { timeSlot } : {};
    const posts = await SnsPosts.find(filter, {
      projection: { /* 全フィールド返すなら projection 省略もOK */ }
    }).toArray();
    res.json(posts);
  } catch (e) { next(e); }
});




// HPログ追加（event/interval 両対応）
app.post('/api/users/:id/hp', async (req, res, next) => {
  try {
    const { id } = req.params;
    const record = {
      time: req.body.time ? new Date(req.body.time) : new Date(),
      stamina: req.body.stamina ?? 0,
      mental: req.body.mental ?? 0,
      battery: req.body.battery ?? 0,
      money: req.body.money ?? 0,
      source: req.body.source, // 'event' | 'interval'
      eventId: req.body.eventId ? new ObjectId(req.body.eventId) : undefined
    };
    const r = await Users.updateOne(
      { _id: new ObjectId(id) },
      { $push: { hp_log: record } }
    );
    if (r.matchedCount === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// ゴール時の可視化用まとめ
app.get('/api/users/:id/summary', async (req, res, next) => {
  try {
    const user = await Users.findOne(
      { _id: new ObjectId(req.params.id) },
      { projection: { hp_log: 1, visited_list: 1 } }
    );
    if (!user) return res.status(404).end();
    const hp = (user.hp_log || []).sort((a, b) => new Date(a.time) - new Date(b.time));
    res.json({ hp, visited_list: user.visited_list || [] });
  } catch (e) { next(e); }
});


// エラーハンドラ
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: String(err.message || err) });
});

// 終了時のクリーンアップ
process.on('SIGINT', async () => {
  try { await client.close(); } finally { process.exit(0); }
});
