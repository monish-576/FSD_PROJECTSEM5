const express = require('express');
const controller = require('../controllers/expenses');

const router = express.Router();

// NOTE: literal segments (/summary, /category/..., /date-range) must be
// registered before /:id, otherwise "summary" would be treated as an id.
router.post('/', controller.createExpense);
router.get('/', controller.getAllExpenses);
router.get('/summary', controller.getSummary);
router.get('/category/:category', controller.getExpensesByCategory);
router.get('/date-range', controller.getExpensesByDateRange);
router.get('/:id', controller.getExpenseById);
router.put('/:id', controller.updateExpense);
router.delete('/:id', controller.deleteExpense);

module.exports = router;
