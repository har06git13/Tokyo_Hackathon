// server/scripts/import_events.mjs
import 'dotenv/config';
import { MongoClient } from 'mongodb';
import { eventList } from './events.mjs';

if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI not set');

const client = new MongoClient(process.env.MONGODB_URI);

try {
  console.log('🔌 connecting...');
  await client.connect();

  const dbName = process.env.DB_NAME || 'tokyo_hackathon_dev';
  const db = client.db(dbName);
  const col = db.collection('events');

  // 事前ログ
  console.log('DB:', dbName);
  console.log('eventList type:', Array.isArray(eventList) ? 'array' : typeof eventList);
  console.log('eventList length:', Array.isArray(eventList) ? eventList.length : 'N/A');

  // 古いインデックスを掃除（存在しなければ無視）
  for (const name of ['event_id_1','id_1']) {
    try { await col.dropIndex(name); console.log('🗑️ dropped index', name); }
    catch (e) { console.log('skip drop', name, '-', e.message); }
  }

  // id -> _id に詰め替え（id が無いデータが混じっていないかもチェック）
  const docs = eventList.map((doc, i) => {
    if (!doc.id) throw new Error(`event at index ${i} has no "id"`);
    const { id, ...rest } = doc;
    return { _id: id, ...rest };
  });

  // 入れ直し
  const del = await col.deleteMany({});
  console.log('🧹 deleted:', del.deletedCount);

  const r = await col.insertMany(docs, { ordered: false });
  console.log(`✅ events inserted: ${r.insertedCount}`);

  const after = await col.countDocuments();
  console.log('📦 now count:', after);
} catch (e) {
  console.error('❌ Import failed:', e);
  process.exit(1);
} finally {
  await client.close();
}
