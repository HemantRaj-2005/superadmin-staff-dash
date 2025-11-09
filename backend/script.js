// backend/script.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// IMPORTANT: include the .js extension in ESM imports
import User from './models/User.js';

async function main() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGO_URI not set in .env');

    await mongoose.connect(mongoUri, {
      // these options are no longer required in modern drivers but harmless
      // useUnifiedTopology: true, useNewUrlParser: true
    });
    console.log('Connected to MongoDB');

    // Set missing soft-delete fields on existing documents
    const r1 = await User.updateMany(
      { isDeleted: { $exists: false } },
      { $set: { isDeleted: false } }
    );
    console.log('isDeleted update - matched:', r1.matchedCount ?? r1.nMatched, 'modified:', r1.modifiedCount ?? r1.nModified);

    const r2 = await User.updateMany(
      { deletedAt: { $exists: false } },
      { $set: { deletedAt: null } }
    );
    console.log('deletedAt ensured - modified:', r2.modifiedCount ?? r2.nModified);

    const r3 = await User.updateMany(
      { scheduledForPermanentDeletion: { $exists: false } },
      { $set: { scheduledForPermanentDeletion: null } }
    );
    console.log('scheduledForPermanentDeletion ensured - modified:', r3.modifiedCount ?? r3.nModified);

    // If you have documents with deletedAt but missing scheduledForPermanentDeletion,
    // set it to deletedAt + 90 days using a cursor (safe fallback if server doesn't support
    // aggregation pipeline updates).
    const cursor = User.find({
      deletedAt: { $ne: null },
      $or: [{ scheduledForPermanentDeletion: null }, { scheduledForPermanentDeletion: { $exists: false } }]
    }).cursor();

    let count = 0;
    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
      if (!doc.scheduledForPermanentDeletion) {
        doc.scheduledForPermanentDeletion = new Date(doc.deletedAt.getTime() + 90 * 24 * 60 * 60 * 1000);
        doc.isDeleted = true;
        await doc.save();
        count++;
      }
    }
    console.log('Scheduled deletion set for', count, 'documents');

    await mongoose.disconnect();
    console.log('Disconnected. Migration complete.');
  } catch (err) {
    console.error('Migration failed:', err);
    try { await mongoose.disconnect(); } catch (e) {}
    process.exit(1);
  }
}

main();
