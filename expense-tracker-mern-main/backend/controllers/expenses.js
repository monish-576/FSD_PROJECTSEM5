const Expense = require('../models/Expense');
const { CATEGORIES } = require('../models/Expense');

function notFoundError(id) {
  const err = new Error(`Expense not found with id: ${id}`);
  err.statusCode = 404;
  return err;
}

function badRequest(message) {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
}

function parseCategory(value) {
  const upper = String(value || '')
    .trim()
    .toUpperCase();
  if (!CATEGORIES.includes(upper)) {
    throw badRequest(`Invalid category: ${value}. Valid values: ${CATEGORIES.join(', ')}`);
  }
  return upper;
}

function parseDateParam(value, name) {
  if (value === undefined) {
    throw badRequest(`Missing required query parameter: ${name}`);
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw badRequest(`Invalid date format for parameter '${name}' (expected yyyy-MM-dd)`);
  }
  return parsed;
}

// Round money to 2 decimals so floating-point sums stay clean (64.99, not 64.99000000000001).
function roundMoney(value) {
  return Math.round(value * 100) / 100;
}

// POST /api/expenses
async function createExpense(req, res, next) {
  try {
    const expense = await Expense.create(req.body);
    res.status(201).json(expense);
  } catch (err) {
    next(err);
  }
}

// GET /api/expenses
async function getAllExpenses(req, res, next) {
  try {
    const expenses = await Expense.find().sort({ date: -1, createdAt: -1 });
    res.json(expenses);
  } catch (err) {
    next(err);
  }
}

// GET /api/expenses/:id
async function getExpenseById(req, res, next) {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      throw notFoundError(req.params.id);
    }
    res.json(expense);
  } catch (err) {
    next(err);
  }
}

// GET /api/expenses/category/:category
async function getExpensesByCategory(req, res, next) {
  try {
    const category = parseCategory(req.params.category);
    const expenses = await Expense.find({ category }).sort({ date: -1, createdAt: -1 });
    res.json(expenses);
  } catch (err) {
    next(err);
  }
}

// GET /api/expenses/date-range?start=&end= (inclusive)
async function getExpensesByDateRange(req, res, next) {
  try {
    const start = parseDateParam(req.query.start, 'start');
    const end = parseDateParam(req.query.end, 'end');
    const expenses = await Expense.find({ date: { $gte: start, $lte: end } }).sort({
      date: -1,
      createdAt: -1,
    });
    res.json(expenses);
  } catch (err) {
    next(err);
  }
}

// GET /api/expenses/summary
async function getSummary(req, res, next) {
  try {
    const [totals] = await Expense.aggregate([
      { $group: { _id: null, totalAmount: { $sum: '$amount' }, totalExpenses: { $sum: 1 } } },
    ]);
    const byCategory = await Expense.aggregate([
      { $group: { _id: '$category', totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    res.json({
      totalAmount: totals ? roundMoney(totals.totalAmount) : 0,
      totalExpenses: totals ? totals.totalExpenses : 0,
      byCategory: byCategory.map((row) => ({
        category: row._id,
        totalAmount: roundMoney(row.totalAmount),
        count: row.count,
      })),
    });
  } catch (err) {
    next(err);
  }
}

// PUT /api/expenses/:id
async function updateExpense(req, res, next) {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!expense) {
      throw notFoundError(req.params.id);
    }
    res.json(expense);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/expenses/:id
async function deleteExpense(req, res, next) {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      throw notFoundError(req.params.id);
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createExpense,
  getAllExpenses,
  getExpenseById,
  getExpensesByCategory,
  getExpensesByDateRange,
  getSummary,
  updateExpense,
  deleteExpense,
};
