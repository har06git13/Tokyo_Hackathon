// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');
const { initGeminiFiles } = require('./gemini-files');
const { getAdvice, cacheKey } = require('./adviceService');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI not set in .env');
  process.exit(1);
}

// ---- Gemini Advice ----
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ADVICE_CACHE_FILE = path.join(__dirname, 'advice_cache.json');

// レートリミット状態（adviceService に渡す）
let _lastCallTime = 0;

// Gemini クライアント・アップロード済みファイル
let genaiClient = null;
let geminiFiles = [];
let geminiInitPromise = null; // 初期化完了を待つための Promise

function loadAdviceCache() {
  try {
    if (fs.existsSync(ADVICE_CACHE_FILE)) {
      return JSON.parse(fs.readFileSync(ADVICE_CACHE_FILE, 'utf8'));
    }
  } catch (_) {}
  return {};
}

function saveAdviceCache(cache) {
  try {
    fs.writeFileSync(ADVICE_CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
  } catch (e) {
    console.warn('[advice] キャッシュ保存失敗:', e.message);
  }
}

const client = new MongoClient(uri);
let db, Users, Events, Facilities, SnsPosts, Results;

async function start() {
  // MongoDB 接続
  await client.connect();
  db = client.db(process.env.DB_NAME || 'tokyo_hackathon_dev');
  Users = db.collection('users');
  Events = db.collection('events');
  Facilities = db.collection('facilities');
  SnsPosts = db.collection('sns');
  Results = db.collection('results');


  console.log('✅ MongoDB connected');

  // Gemini Files API 初期化（非同期・バックグラウンド）
  // サーバー起動をブロックせず、/api/advice の初回リクエスト時に完了を待つ
  if (GEMINI_API_KEY) {
    genaiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    geminiInitPromise = initGeminiFiles(genaiClient)
      .then(files => {
        geminiFiles = files;
        console.log(`✅ Gemini Files 準備完了 (${files.length}件)`);
      })
      .catch(e => console.warn('[gemini-files] 初期化失敗（フォールバック継続）:', e.message));
  } else {
    console.warn('[advice] GEMINI_API_KEY 未設定: LLMアドバイスは無効（ルールベースフォールバックのみ）');
    geminiInitPromise = Promise.resolve();
  }

  app.listen(PORT, () =>
    console.log(`Server listening on http://localhost:${PORT}`)
  );
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

app.get('/api/facilities/:id', async (req, res) => {
  try {
    const row = await db.collection('facilities').findOne({ _id: req.params.id });
    if (!row) return res.status(404).json({ message: 'not found' });
    res.json(row);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'failed to fetch facility' });
  }
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


// ---- Gemini 防災アドバイス API ----
app.get('/api/advice', async (req, res) => {
  const actions = (req.query.actions || '').trim();
  if (!actions) return res.json({ advice: null, fromCache: false });

  // 初期化がまだ完了していない場合は待つ（初回リクエスト時のみ遅延が発生）
  if (geminiInitPromise) await geminiInitPromise;

  const cache = loadAdviceCache();
  const fromCache = !!cache[cacheKey(actions)];

  try {
    const advice = await getAdvice(actions, {
      genaiClient,
      geminiFiles,
      cache,
      saveCache: saveAdviceCache,
      getLastCallTime: () => _lastCallTime,
      setLastCallTime: (t) => { _lastCallTime = t; },
    });
    res.json({ advice, fromCache });
  } catch (e) {
    console.error('[advice] Gemini API エラー:', e.message);
    res.json({ advice: null, fromCache: false });
  }
});

// ---- 結果保存 API（モデル無し：ネイティブドライバ）----
app.post('/api/results', async (req, res, next) => {
  try {
    const { AgeType, Gender, ResidenceType, EventHistory } = req.body || {};

    // EventHistory の正規化（ISO 文字列/数値/Date を Date へ）
    const hist = Array.isArray(EventHistory)
      ? EventHistory.map(h => {
          const t = h?.time;
          const d = (t instanceof Date) ? t : new Date(t);
          return {
            id: String(h?.id ?? ''),
            time: isNaN(d.getTime()) ? new Date() : d,
          };
        })
      : [];

    const doc = {
      AgeType: AgeType ?? null,
      Gender: Gender ?? null,
      ResidenceType: ResidenceType ?? null,
      EventHistory: hist,
      createdAt: new Date()
    };

    const r = await Results.insertOne(doc);
    res.status(201).json({ _id: r.insertedId });
  } catch (e) { next(e); }
});

// ---- 統計 API ----
const FAC_AREA_MAP = {
  fac_000: '渋谷駅周辺', fac_001: '渋谷駅周辺',
  fac_002: '道玄坂エリア', fac_003: '青山エリア',
  fac_004: '代々木エリア', fac_005: '原宿エリア',
};
const EVENT_LOCATION_MAP = {
  event_walk_001: 'fac_001', event_walk_002: 'fac_002',
  event_walk_003: 'fac_003', event_walk_004: 'fac_004',
  event_epilogue_001: 'fac_005',
};
const FAC_NAME_MAP = {
  fac_000: '渋谷駅前', fac_001: '渋谷センター街',
  fac_002: '道玄坂', fac_003: '公園通り',
  fac_004: '代々木公園', fac_005: 'ウィズ原宿',
};

app.get('/api/results/stats', async (req, res, next) => {
  try {
    const finalDestination = req.query.finalDestination ?? null;
    const allResults = await Results.find({}).toArray();
    const total = allResults.length;
    if (total === 0) return res.json({
      total: 0, finalDestinationDist: [],
      sameDestinationRate: 0, batteryRentalRate: 0,
      cashWithdrawRate: 0, noSnsRate: 0, sameDestinationFacilityName: null,
    });

    const getFinalFac = (hist) => {
      if (!Array.isArray(hist)) return null;
      const sorted = [...hist].sort((a, b) => new Date(a.time) - new Date(b.time));
      for (let i = sorted.length - 1; i >= 0; i--) {
        const fac = EVENT_LOCATION_MAP[sorted[i].id];
        if (fac) return fac;
      }
      return null;
    };

    const areaCounts = {};
    for (const r of allResults) {
      const area = FAC_AREA_MAP[getFinalFac(r.EventHistory)] ?? '不明';
      areaCounts[area] = (areaCounts[area] ?? 0) + 1;
    }
    const finalDestinationDist = Object.entries(areaCounts).map(([area, count]) => ({
      area, count, rate: Math.round(count / total * 100),
    }));

    const sameCount = finalDestination
      ? allResults.filter(r => getFinalFac(r.EventHistory) === finalDestination).length : 0;
    const batteryCount = allResults.filter(r =>
      Array.isArray(r.EventHistory) && r.EventHistory.some(e => e.id === 'event_walk_001')
    ).length;
    const cashCount = allResults.filter(r =>
      Array.isArray(r.EventHistory) && r.EventHistory.some(e => e.id === 'event_walk_003')
    ).length;
    const noSnsCount = allResults.filter(r =>
      !Array.isArray(r.EventHistory) || !r.EventHistory.some(e => e.id?.startsWith('event_sns_'))
    ).length;

    res.json({
      total,
      finalDestinationDist,
      sameDestinationRate: Math.round(sameCount / total * 100),
      batteryRentalRate: Math.round(batteryCount / total * 100),
      cashWithdrawRate: Math.round(cashCount / total * 100),
      noSnsRate: Math.round(noSnsCount / total * 100),
      sameDestinationFacilityName: FAC_NAME_MAP[finalDestination] ?? null,
    });
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
