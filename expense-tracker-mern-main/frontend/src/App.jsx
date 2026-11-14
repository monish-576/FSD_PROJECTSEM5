import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CATEGORIES,
  createExpense,
  deleteExpense,
  getExpenses,
  getSummary,
  updateExpense,
} from './api.js';
import ExpenseForm from './components/ExpenseForm.jsx';
import ExpenseList from './components/ExpenseList.jsx';
import Summary from './components/Summary.jsx';

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState(null);
  const [editing, setEditing] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const refresh = useCallback(async () => {
    try {
      const [allExpenses, summaryData] = await Promise.all([getExpenses(), getSummary()]);
      setExpenses(allExpenses);
      setSummary(summaryData);
      setError('');
    } catch (err) {
      setError(err.message || 'Could not reach the server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const visibleExpenses = useMemo(
    () =>
      categoryFilter === 'ALL'
        ? expenses
        : expenses.filter((expense) => expense.category === categoryFilter),
    [expenses, categoryFilter]
  );

  async function handleSubmit(values) {
    try {
      if (editing) {
        await updateExpense(editing.id, values);
        setEditing(null);
      } else {
        await createExpense(values);
      }
      setFormErrors(null);
      await refresh();
    } catch (err) {
      // The API returns per-field messages; show them under the form fields.
      setFormErrors(err.fieldErrors || { description: err.message });
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this expense?')) {
      return;
    }
    try {
      await deleteExpense(id);
      await refresh();
    } catch (err) {
      setError(err.message || 'Could not delete the expense.');
    }
  }

  return (
    <main className="container">
      <header>
        <h1>Expense Tracker</h1>
        <p>Log spending, filter by category, and see where the money goes.</p>
      </header>

      {error && <p className="banner error">{error}</p>}

      <Summary summary={summary} />

      <ExpenseForm
        editing={editing}
        onSubmit={handleSubmit}
        onCancel={() => {
          setEditing(null);
          setFormErrors(null);
        }}
        serverErrors={formErrors}
      />

      <section className="filters">
        <label>
          Category
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="ALL">All categories</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
      </section>

      {loading ? (
        <p>Loading…</p>
      ) : (
        <ExpenseList expenses={visibleExpenses} onEdit={setEditing} onDelete={handleDelete} />
      )}
    </main>
  );
}
