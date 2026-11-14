export default function Summary({ summary }) {
  if (!summary) {
    return null;
  }

  return (
    <section className="card summary">
      <div className="summary-total">
        <span className="summary-label">Total spent</span>
        <span className="summary-value">₹{summary.totalAmount.toFixed(2)}</span>
        <span className="summary-count">
          {summary.totalExpenses} expense{summary.totalExpenses === 1 ? '' : 's'}
        </span>
      </div>
      {summary.byCategory.length > 0 && (
        <ul className="summary-breakdown">
          {summary.byCategory.map((row) => (
            <li key={row.category}>
              <span>{row.category}</span>
              <span>
                ₹{row.totalAmount.toFixed(2)} · {row.count}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
