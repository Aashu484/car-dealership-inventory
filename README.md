\# Apex Motors - Car Dealership Inventory



A full-stack car dealership inventory app with login, role-based access and vehicle search.



\*\*Live demo:\*\* https://car-dealership-inventory-beta.vercel.app



> The backend runs on Render's free tier, so the first load can take up to 50 seconds while it wakes up.



\## Demo logins



| Role  | Email                    | Password   |

|-------|--------------------------|------------|

| Admin | admin@dealership.local   | Admin123!  |

| Buyer | buyer@dealership.local   | Buyer123!  |



\## Tech stack



\- \*\*Frontend:\*\* React, TypeScript, Vite, Tailwind CSS

\- \*\*Backend:\*\* Node.js, Express, TypeScript, SQLite (better-sqlite3)

\- \*\*Auth:\*\* JWT, bcrypt

\- \*\*Validation:\*\* Zod

\- \*\*Testing:\*\* Jest, Supertest

\- \*\*Hosting:\*\* Vercel (frontend), Render (backend)



\## Run locally



Backend:

```

cd backend

copy .env.example .env

npm install

npm run dev

```

Runs on http://localhost:4000



Frontend (in a second terminal):

```

cd frontend

npm install

npm run dev

```

Runs on http://localhost:5173 and proxies `/api` to the backend.



\## Run tests



```

cd backend

npm test

```

