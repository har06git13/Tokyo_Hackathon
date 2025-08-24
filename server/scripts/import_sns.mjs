import 'dotenv/config';
import { MongoClient } from 'mongodb';
import { snsPostList } from './sns.mjs';

if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI not set');

const client = new MongoClient(process.env.MONGODB_URI);

try {
  console.log('🔌 connecting...');
  await client.connect();
  const db = client.db(process.env.DB_NAME || 'tokyo_hackathon_dev');
  const col = db.collection('sns');

  // 旧インデックス掃除（無ければ無視）
  for (const name of ['id_1','sns_id_1']) {
    try { await col.dropIndex(name); console.log('🗑 dropped', name); }
    catch { /* skip */ }
  }

  // 正常値のチェックのみ（変換はしない）
  const ALLOWED_TYPES = new Set(['rumor','useful','official','personal','other']);
  const ALLOWED_SLOTS = new Set(['2h','4h','6h','8h','10h']);

  const docs = snsPostList.map((doc, i) => {
    if (!doc.id) throw new Error(`sns at index ${i} has no "id"`);
    if (!ALLOWED_SLOTS.has(doc.timeSlot)) throw new Error(`sns ${doc.id} invalid timeSlot: ${doc.timeSlot}`);
    if (!ALLOWED_TYPES.has(doc.type)) throw new Error(`sns ${doc.id} invalid type: ${doc.type}`);
    const { id, ...rest } = doc;
    return { _id: id, ...rest }; // ← type/timeSlotはそのまま保存
  });

  const del = await col.deleteMany({});
  console.log('🧹 deleted:', del.deletedCount);

  const r = await col.insertMany(docs, { ordered: false });
  console.log(`✅ sns inserted: ${r.insertedCount}`);

  // よく使う絞り込み用のインデックス
  await col.createIndex({ timeSlot: 1, type: 1 });
  await col.createIndex({ text: 'text', userName: 'text' });

  console.log('📦 now count:', await col.countDocuments());
} catch (e) {
  console.error('❌ Import failed:', e);
  process.exit(1);
} finally {
  await client.close();
}
