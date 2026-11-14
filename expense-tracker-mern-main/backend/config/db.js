const mongoose = require('mongoose');

const DEFAULT_URI = 'mongodb://127.0.0.1:27017/expense_tracker';

/**
 * Connect to MongoDB. `uri` overrides MONGO_URI (used by tests, which point
 * at an in-memory server).
 */
async function connectDB(uri) {
  await mongoose.connect(uri || process.env.MONGO_URI || DEFAULT_URI);
}

module.exports = { connectDB, DEFAULT_URI };
