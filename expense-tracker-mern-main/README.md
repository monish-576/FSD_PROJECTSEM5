# Expense Tracker (MERN Stack)

A full-stack expense tracker built with the MERN stack: **MongoDB, Express.js,
React.js, and Node.js**. Log expenses with a description, amount, category and
date; filter by category or date range; and see total spend with a per-category
breakdown.

This is the MERN version of the
[Spring Boot Expense Tracker API](https://github.com/Vansh13199/expense-tracker):
same 8 endpoints, same validation rules, same error format — plus a React
frontend on top.

## Tech stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Database | MongoDB 8, Mongoose 8                   |
| Backend  | Node.js 20+, Express 4, Mongoose        |
| Frontend | React 19, Vite 6                        |
| Tests    | Jest, Supertest, mongodb-memory-server  |

## Project structure

```
expense-tracker-mern/
├── backend/                    # Express + Mongoose REST API (port 5000)
│   ├── server.js               # entry point: connect DB, listen
│   ├── app.js                  # Express app (used by server and tests)
│   ├── config/db.js
│   ├── models/Expense.js       # Mongoose schema + validation
│   ├── controllers/expenses.js
│   ├── routes/expenses.js
│   ├── middleware/errorHandler.js
│   ├── seed.js                 # inserts 4 sample expenses
│   ├── tests/expenses.test.js
│   └── .env.example
├── frontend/                   # React + Vite app (port 5173, proxies /api)
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js              # backend calls
│   │   ├── components/
│   │   │   ├── ExpenseForm.jsx
│   │   │   ├── ExpenseList.jsx
│   │   │   └── Summary.jsx
│   │   └── styles.css
│   └── vite.config.js
└── postman/Expense_Tracker_MERN.postman_collection.json
```

## Data model

`Expense` (MongoDB `expenses` collection):

| Field         | Type   | Rules                                              |
|---------------|--------|----------------------------------------------------|
| `id`          | String | MongoDB ObjectId (returned as `id`, not `_id`)     |
| `description` | String | Required, max 255 chars                            |
| `amount`      | Number | Required, at least 0.01                            |
| `category`    | String | Required, one of the values below                  |
| `date`        | Date   | Required, cannot be in the future (`yyyy-MM-dd`)   |

Categories: `FOOD`, `TRANSPORT`, `UTILITIES`, `ENTERTAINMENT`, `HEALTHCARE`,
`SHOPPING`, `EDUCATION`, `OTHER`. Category matching is case-insensitive, so
`food` and `FOOD` both work in request bodies and URLs.

## Setup

### Prerequisites

- Node.js 20+ and npm
- MongoDB 8 running locally on the default port (`mongodb://127.0.0.1:27017`)

### Install

```bash
npm run install-all     # installs backend + frontend dependencies
```

### Configure (optional)

```bash
cp backend/.env.example backend/.env
```

| Variable    | Default                                         |
|-------------|-------------------------------------------------|
| `PORT`      | `5000`                                          |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/expense_tracker`     |

### Run

```bash
npm run dev             # backend (port 5000) + frontend (port 5173) together
```

Or run them separately in two terminals:

```bash
npm --prefix backend run dev    # API with auto-reload (nodemon)
npm --prefix frontend run dev   # React dev server at http://localhost:5173
```

The frontend proxies `/api` to the backend, so the UI works with no extra
configuration. Open http://localhost:5173.

### Sample data

```bash
npm run seed            # inserts 4 sample expenses (clears the collection first)
```

### Run the tests

```bash
npm test                # backend Jest + Supertest suite (18 tests)
```

Tests use an in-memory MongoDB (mongodb-memory-server), so no local MongoDB
is needed for them. The first run downloads a MongoDB binary (~60 MB).

### Production build (frontend)

```bash
npm run build           # outputs to frontend/dist/
```

## API endpoints

Base URL: `http://localhost:5000/api/expenses`

| Method | Endpoint                              | Description                                  | Status    |
|--------|---------------------------------------|----------------------------------------------|-----------|
| POST   | `/api/expenses`                       | Create an expense                            | 201       |
| GET    | `/api/expenses`                       | List all expenses (newest first)             | 200       |
| GET    | `/api/expenses/{id}`                  | Get one expense                              | 200 / 404 |
| PUT    | `/api/expenses/{id}`                  | Replace an expense                           | 200 / 404 |
| DELETE | `/api/expenses/{id}`                  | Delete an expense                            | 204 / 404 |
| GET    | `/api/expenses/category/{category}`   | Expenses in one category                     | 200 / 400 |
| GET    | `/api/expenses/date-range?start=&end=`| Expenses between two dates (inclusive)       | 200 / 400 |
| GET    | `/api/expenses/summary`               | Total spend + per-category breakdown         | 200       |
| GET    | `/api/health`                         | Health check                                 | 200       |

## Examples

Create an expense:

```bash
curl -X POST http://localhost:5000/api/expenses \
  -H "Content-Type: application/json" \
  -d '{"description":"Groceries at Big Bazaar","amount":49.99,"category":"FOOD","date":"2026-11-13"}'
```

```json
{
  "id": "6915e8a1f2c4a1b2c3d4e5f6",
  "description": "Groceries at Big Bazaar",
  "amount": 49.99,
  "category": "FOOD",
  "date": "2026-11-13",
  "createdAt": "2026-11-13T14:40:00.000Z",
  "updatedAt": "2026-11-13T14:40:00.000Z"
}
```

Get the spending summary:

```bash
curl http://localhost:5000/api/expenses/summary
```

```json
{
  "totalAmount": 170.49,
  "totalExpenses": 4,
  "byCategory": [
    { "category": "ENTERTAINMENT", "totalAmount": 15, "count": 1 },
    { "category": "FOOD", "totalAmount": 49.99, "count": 1 },
    { "category": "TRANSPORT", "totalAmount": 20, "count": 1 },
    { "category": "UTILITIES", "totalAmount": 85.5, "count": 1 }
  ]
}
```

## Error format

Every failed request returns the same JSON shape:

```json
{
  "timestamp": "2026-11-13T19:45:00.123Z",
  "status": 404,
  "error": "Not Found",
  "message": "Expense not found with id: 000000000000000000000000",
  "path": "/api/expenses/000000000000000000000000",
  "fieldErrors": null
}
```

| Status | When                                                                                     |
|--------|------------------------------------------------------------------------------------------|
| 400    | Validation failed (per-field details in `fieldErrors`), bad category, bad date, malformed JSON, non-ObjectId id |
| 404    | No expense with that id, or unknown route                                                |
| 500    | Unexpected server error (no stack trace is leaked)                                       |

## Postman

Import `postman/Expense_Tracker_MERN.postman_collection.json`. It has one
request per endpoint, plus a 404 check. Run them in order: **Create Expense**
saves the new id to `{{expense_id}}`, which the Get/Update/Delete requests use.
`{{base_url}}` defaults to `http://localhost:5000`.

## License

MIT — see [LICENSE](LICENSE).
