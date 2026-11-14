import { useEffect, useState } from 'react';
import { CATEGORIES } from '../api.js';

const EMPTY_FORM = { description: '', amount: '', category: 'FOOD', date: '' };

export default function ExpenseForm({ editing, onSubmit, onCancel, serverErrors }) {
  const [form, setForm] = useState(EMPTY_FORM);

  // When the user picks an expense to edit, fill the form with its values.
  useEffect(() => {
    if (editing) {
      setForm({
        description: editing.description,
        amount: String(editing.amount),
        category: editing.category,
        date: editing.date,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editing]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      description: form.description.trim(),
      amount: Number(form.amount),
      category: form.category,
      date: form.date,
    });
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2>{editing ? 'Edit expense' : 'Add expense'}</h2>

      <label>
        Description
        <input
          type="text"
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          placeholder="Groceries at Big Bazaar"
        />
        {serverErrors?.description && <span className="field-error">{serverErrors.description}</span>}
      </label>

      <label>
        Amount
        <input
          type="number"
          min="0.01"
          step="0.01"
          value={form.amount}
          onChange={(e) => update('amount', e.target.value)}
          placeholder="49.99"
        />
        {serverErrors?.amount && <span className="field-error">{serverErrors.amount}</span>}
      </label>

      <label>
        Category
        <select value={form.category} onChange={(e) => update('category', e.target.value)}>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        {serverErrors?.category && <span className="field-error">{serverErrors.category}</span>}
      </label>

      <label>
        Date
        <input
          type="date"
          value={form.date}
          onChange={(e) => update('date', e.target.value)}
        />
        {serverErrors?.date && <span className="field-error">{serverErrors.date}</span>}
      </label>

      <div className="form-actions">
        <button type="submit" className="primary">
          {editing ? 'Save changes' : 'Add expense'}
        </button>
        {editing && (
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
