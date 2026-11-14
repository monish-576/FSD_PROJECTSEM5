// Inserts sample expenses. Run with: npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('./config/db');
const Expense = require('./models/Expense');

const SAMPLES = [
  { description: 'Groceries at Big Bazaar', amount: 49.99, category: 'FOOD', date: '2026-11-13' },
  { description: 'Metro card top-up', amount: 20.0, category: 'TRANSPORT', date: '2026-11-12' },
  { description: 'Electricity bill', amount: 85.5, category: 'UTILITIES', date: '2026-11-10' },
  { description: 'Movie tickets', amount: 15.0, category: 'ENTERTAINMENT', date: '2026-11-09' },
];

async function seed() {
  await connectDB();
  await Expense.deleteMany({});
  const inserted = await Expense.insertMany(SAMPLES);
  console.log(`Seeded ${inserted.length} expenses`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seeding failed:', err.message);
  process.exit(1);
});
