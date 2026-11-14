// All backend calls go through the Vite dev proxy (/api -> localhost:5000).
const BASE = '/api/expenses';

async function handleResponse(res) {
  if (res.status === 204) {
    return null;
  }
  const body = await res.json();
  if (!res.ok) {
    const error = new Error(body.message || 'Request failed');
    error.status = res.status;
    error.fieldErrors = body.fieldErrors || null;
    throw error;
  }
  return body;
}

export async function getExpenses() {
  const res = await fetch(BASE);
  return handleResponse(res);
}

export async function getSummary() {
  const res = await fetch(`${BASE}/summary`);
  return handleResponse(res);
}

export async function createExpense(expense) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expense),
  });
  return handleResponse(res);
}

export async function updateExpense(id, expense) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expense),
  });
  return handleResponse(res);
}

export async function deleteExpense(id) {
  const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
  return handleResponse(res);
}

export const CATEGORIES = [
  'FOOD',
  'TRANSPORT',
  'UTILITIES',
  'ENTERTAINMENT',
  'HEALTHCARE',
  'SHOPPING',
  'EDUCATION',
  'OTHER',
];
