# AI Weather Intelligence and Decision Support System

## Requirements
- Node.js 20.19+ or 22.12+ (Vite 7 requirement)
- An OpenWeather API key
- Internet access for live weather and geocoding

## Security and environment
The uploaded API key was removed from this distribution. Since it was pasted into a conversation, revoke/regenerate it in your OpenWeather account before use.

1. Copy `backend/.env.example` to `backend/.env`.
2. Put your newly generated key in `OPENWEATHER_API_KEY`.
3. Copy root `.env.example` to root `.env` if you want to configure `VITE_API_BASE_URL`. The default is `http://localhost:5000/api`.
4. Never put an API secret in a `VITE_*` variable. Vite exposes `VITE_*` values to browser code.

## Start the backend (Terminal 1)
```powershell
cd backend
npm install
npm run dev
```
Backend default: http://localhost:5000

## Start the frontend (Terminal 2, project root)
```powershell
npm install
npm run dev
```
Open the Vite URL printed in the terminal (usually http://localhost:5173).

## Orchestrator endpoints
- `GET /api/orchestrator/route?query=...&lat=...&lon=...` creates a routing plan.
- `GET /api/orchestrator/execute?query=...&lat=...&lon=...` executes the plan.
- `POST /api/orchestrator/execute` accepts JSON with `query`, optional `lat`/`lon`, and optional supported input fields.

## AI Intelligence frontend
Use the **AI Intelligence** item in the sidebar. Load a city in the weather dashboard first so the current coordinates can be included in the orchestrator request.

## Troubleshooting
- `OPENWEATHER_API_KEY is not configured`: create `backend/.env` from the example and add your key.
- `City not found`: check API key validity, OpenWeather geocoding access, and backend terminal output.
- Browser cannot reach backend: ensure both terminals are running and `FRONTEND_URL` matches the Vite origin.
- Insufficient weather data: inspect the Data Intelligence validation checks; do not disable the quality gate just to force a successful response.
