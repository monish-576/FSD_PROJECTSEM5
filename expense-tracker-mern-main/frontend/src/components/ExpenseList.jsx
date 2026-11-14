export default function ExpenseList({ expenses, onEdit, onDelete }) {
  if (expenses.length === 0) {
    return <p className="empty">No expenses yet. Add your first one above.</p>;
  }

  return (
    <ul className="expense-list">
      {expenses.map((expense) => (
        <li key={expense.id} className="card expense-row">
          <div className="expense-main">
            <span className="expense-description">{expense.description}</span>
            <span className="expense-meta">
              {expense.category} · {expense.date}
            </span>
          </div>
          <span className="expense-amount">₹{expense.amount.toFixed(2)}</span>
          <div className="expense-actions">
            <button type="button" onClick={() => onEdit(expense)}>
              Edit
            </button>
            <button type="button" className="danger" onClick={() => onDelete(expense.id)}>
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
