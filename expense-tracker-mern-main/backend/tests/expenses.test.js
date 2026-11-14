const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const Expense = require('../models/Expense');

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  await Expense.deleteMany({});
});

function sampleExpense(overrides = {}) {
  return {
    description: 'Groceries at Big Bazaar',
    amount: 49.99,
    category: 'FOOD',
    date: '2026-11-13',
    ...overrides,
  };
}

describe('POST /api/expenses', () => {
  it('creates an expense and returns 201', async () => {
    const res = await request(app).post('/api/expenses').send(sampleExpense());

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.description).toBe('Groceries at Big Bazaar');
    expect(res.body.amount).toBe(49.99);
    expect(res.body.category).toBe('FOOD');
    expect(res.body.date).toBe('2026-11-13');
  });

  it('accepts a lowercase category', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .send(sampleExpense({ category: 'food' }));

    expect(res.status).toBe(201);
    expect(res.body.category).toBe('FOOD');
  });

  it('returns 400 with per-field errors for invalid input', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .send({ description: '', amount: 0, category: null, date: '2999-01-01' });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
    expect(res.body.fieldErrors.description).toBe('Description is required');
    expect(res.body.fieldErrors.amount).toBe('Amount must be at least 0.01');
    expect(res.body.fieldErrors.category).toBe('Category is required');
    expect(res.body.fieldErrors.date).toBe('Date cannot be in the future');
  });

  it('returns 400 for an unknown category', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .send(sampleExpense({ category: 'NOPE' }));

    expect(res.status).toBe(400);
    expect(res.body.fieldErrors.category).toMatch(/Invalid category/);
  });
});

describe('GET /api/expenses', () => {
  it('lists all expenses', async () => {
    await Expense.create([
      sampleExpense(),
      sampleExpense({ description: 'Metro card top-up', amount: 20, category: 'TRANSPORT' }),
    ]);

    const res = await request(app).get('/api/expenses');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it('returns one expense by id', async () => {
    const created = await Expense.create(sampleExpense());

    const res = await request(app).get(`/api/expenses/${created._id}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(created._id.toString());
    expect(res.body.amount).toBe(49.99);
  });

  it('returns 404 for a missing id', async () => {
    const missing = new mongoose.Types.ObjectId();

    const res = await request(app).get(`/api/expenses/${missing}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe(`Expense not found with id: ${missing}`);
  });

  it('returns 400 for a non-ObjectId id', async () => {
    const res = await request(app).get('/api/expenses/abc');

    expect(res.status).toBe(400);
    expect(res.body.status).toBe(400);
  });
});

describe('PUT /api/expenses/:id', () => {
  it('updates an expense and returns 200', async () => {
    const created = await Expense.create(sampleExpense());

    const res = await request(app)
      .put(`/api/expenses/${created._id}`)
      .send(sampleExpense({ description: 'Groceries (weekly)', amount: 59.99 }));

    expect(res.status).toBe(200);
    expect(res.body.description).toBe('Groceries (weekly)');
    expect(res.body.amount).toBe(59.99);
  });

  it('returns 404 for a missing id', async () => {
    const missing = new mongoose.Types.ObjectId();

    const res = await request(app).put(`/api/expenses/${missing}`).send(sampleExpense());

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/expenses/:id', () => {
  it('deletes an expense and returns 204', async () => {
    const created = await Expense.create(sampleExpense());

    const res = await request(app).delete(`/api/expenses/${created._id}`);

    expect(res.status).toBe(204);
    expect(await Expense.findById(created._id)).toBeNull();
  });

  it('returns 404 for a missing id', async () => {
    const missing = new mongoose.Types.ObjectId();

    const res = await request(app).delete(`/api/expenses/${missing}`);

    expect(res.status).toBe(404);
  });
});

describe('GET /api/expenses/category/:category', () => {
  it('filters by category (case-insensitive)', async () => {
    await Expense.create([
      sampleExpense(),
      sampleExpense({ description: 'Pizza night', amount: 15, category: 'FOOD' }),
      sampleExpense({ description: 'Metro card top-up', amount: 20, category: 'TRANSPORT' }),
    ]);

    const res = await request(app).get('/api/expenses/category/food');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it('returns 400 for an unknown category', async () => {
    const res = await request(app).get('/api/expenses/category/NOPE');

    expect(res.status).toBe(400);
  });
});

describe('GET /api/expenses/date-range', () => {
  it('returns expenses within the range (inclusive)', async () => {
    await Expense.create([
      sampleExpense({ date: '2026-11-13' }),
      sampleExpense({ description: 'Metro card top-up', amount: 20, date: '2026-11-10' }),
      sampleExpense({ description: 'Old bill', amount: 5, date: '2026-10-01' }),
    ]);

    const res = await request(app).get('/api/expenses/date-range?start=2026-11-10&end=2026-11-13');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it('returns 400 when a parameter is missing', async () => {
    const res = await request(app).get('/api/expenses/date-range?start=2026-11-01');

    expect(res.status).toBe(400);
  });
});

describe('GET /api/expenses/summary', () => {
  it('returns totals and a per-category breakdown', async () => {
    await Expense.create([
      sampleExpense(),
      sampleExpense({ description: 'Pizza night', amount: 15, category: 'FOOD' }),
      sampleExpense({ description: 'Metro card top-up', amount: 20, category: 'TRANSPORT' }),
    ]);

    const res = await request(app).get('/api/expenses/summary');

    expect(res.status).toBe(200);
    expect(res.body.totalAmount).toBe(84.99);
    expect(res.body.totalExpenses).toBe(3);
    expect(res.body.byCategory).toHaveLength(2);
    const food = res.body.byCategory.find((row) => row.category === 'FOOD');
    expect(food.totalAmount).toBe(64.99);
    expect(food.count).toBe(2);
  });

  it('returns zeros when there are no expenses', async () => {
    const res = await request(app).get('/api/expenses/summary');

    expect(res.status).toBe(200);
    expect(res.body.totalAmount).toBe(0);
    expect(res.body.totalExpenses).toBe(0);
    expect(res.body.byCategory).toHaveLength(0);
  });
});
