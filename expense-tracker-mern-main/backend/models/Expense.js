const mongoose = require('mongoose');

const CATEGORIES = [
  'FOOD',
  'TRANSPORT',
  'UTILITIES',
  'ENTERTAINMENT',
  'HEALTHCARE',
  'SHOPPING',
  'EDUCATION',
  'OTHER',
];

const expenseSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [255, 'Description must be at most 255 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be at least 0.01'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: CATEGORIES,
        message: 'Invalid category: {VALUE}',
      },
      // Case-insensitive input: "food" is stored as "FOOD".
      uppercase: true,
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      validate: {
        validator: (value) => value <= new Date(),
        message: 'Date cannot be in the future',
      },
    },
  },
  { timestamps: true }
);

// Clean JSON shape: `id` instead of `_id`, no `__v`, date as yyyy-MM-dd.
expenseSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    if (ret.date instanceof Date) {
      ret.date = ret.date.toISOString().slice(0, 10);
    }
    return ret;
  },
});

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
module.exports.CATEGORIES = CATEGORIES;
