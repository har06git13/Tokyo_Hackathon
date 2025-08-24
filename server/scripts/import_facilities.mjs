import 'dotenv/config';
import { MongoClient } from 'mongodb';
import { facilityList } from './facilities.mjs';

const client = new MongoClient(process.env.MONGODB_URI);

try {
  await client.connect();
  const db = client.db(process.env.DB_NAME || 'tokyo_hackathon_dev');
  const col = db.collection('facilities');

  await col.dropIndex('facility_id_1').catch(()=>{});
  await col.dropIndex('id_1').catch(()=>{});

  const docs = facilityList.map(({ id, ...rest }) => ({ _id: id, ...rest }));
  await col.deleteMany({});
  const r = await col.insertMany(docs, { ordered: false });
  console.log(`✅ facilities inserted: ${r.insertedCount}`);
} catch (e) {
  console.error('❌ Import failed:', e);
  process.exit(1);
} finally {
  await client.close();
}
