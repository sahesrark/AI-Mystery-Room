# AI Mystery Room

A MERN detective mystery application. Players create a fictional premise, inspect a case briefing and evidence, compare suspect statements with a timeline, keep notes and bookmarks, make one final accusation, and read an evidence-based reveal.

## Deploy to Render

The repository includes [`render.yaml`](render.yaml) for a Render Blueprint deployment. It creates a static React site and an Express API. MongoDB Atlas stores cases and progress; Gemini generates case content. Keep both provider secrets on the API service only.

### 1. Prepare the repository

1. Push this project to a GitHub repository that your Render account can access.
2. Check that `server/.env` and `client/.env` are not committed. The `.gitignore` excludes `.env` files; the checked-in `.env.example` files contain placeholders only.
3. If you choose different Render service names or custom domains, note the final frontend and API URLs. The Blueprint defaults to `https://mystery-room-client.onrender.com` and `https://mystery-room-api.onrender.com`.

### 2. Prepare MongoDB Atlas

1. Create or select an Atlas cluster and create a database user with a strong password.
2. In **Network Access**, allow connections from the Render API service. Prefer restricting access to the backend's outbound IP addresses or using private connectivity where available. Render Free instances do not provide static outbound IPs; for a short test, Atlas's `0.0.0.0/0` rule can permit access from anywhere, but it is broad and should be avoided for production. Use a unique, least-privilege database user if you use that temporary setting.
3. Copy the Atlas connection string. Replace its username, password, and database name. URL-encode special characters in the password.

### 3. Create the Render Blueprint

1. In Render, choose **New → Blueprint** and connect the GitHub repository.
2. Select the repository's `render.yaml` and create the Blueprint.
3. Enter the requested `MONGODB_URI` and `GEMINI_API_KEY` values in Render's prompt. Do not put either secret in `render.yaml`, the client environment, or Git.
4. Let Render deploy both services. The API deploy waits for a working MongoDB connection; check its Deploys and Logs pages if it fails.

The Blueprint configures these production settings:

| Service | Configuration |
| --- | --- |
| `mystery-room-api` | Node/Express, Singapore region, `/api/v1/health` health check |
| `mystery-room-client` | Vite build, `dist` publish directory, React Router rewrite |
| API secrets | `MONGODB_URI` and `GEMINI_API_KEY` are entered as Render secrets |
| API settings | `NODE_ENV=production`, required database, proxy trust, secure guest cookie |
| Gemini model | `GEMINI_MODEL=gemini-3.6-flash` |

If Render assigns different public URLs, update **both** sides:

- On the API service, set `CLIENT_ORIGIN` to the frontend's exact origin, such as `https://your-frontend.onrender.com` (no path or trailing slash).
- On the static site, set `VITE_API_BASE_URL` to `https://your-api.onrender.com/api/v1`, then rebuild and deploy the site.

The frontend and API must use HTTPS in production. If you use custom domains on different registrable domains, also set `COOKIE_SAME_SITE=none` on the API; the API already sets `Secure` for production cookies. Keep `CLIENT_ORIGIN` restricted to your actual frontend origin.

### 4. Verify the deployment

1. Open `https://<your-api-host>/api/v1/health`. Expect `{"status":"ok","database":"connected"}`.
2. Open the frontend's HTTPS URL. Create a fictional scenario longer than 30 characters and name the suspects and their roles in the scenario brief.
3. Inspect the generated suspects, evidence, and timeline. Then add a note, submit an accusation, and confirm the reveal opens.
4. Reopen the site and check that the case is still listed. MongoDB should preserve it across API restarts.
5. If a request fails, inspect the API service's Render logs. Gemini can return temporary 503 high-demand errors; retry later or select another currently available model using the API service's `GEMINI_MODEL` setting.

### Free-tier note

Render's Free web services spin down after 15 minutes without inbound traffic and can take about a minute to wake. Local filesystem changes are ephemeral, which is why this deployment requires MongoDB Atlas. Free services are intended for testing and hobby projects, not production reliability. For a public production launch, choose an always-on API plan and review Render and Gemini usage/cost limits. See [Render's Free instance limitations](https://render.com/docs/free).

## Run locally

Requirements: Node.js 20+ and npm.

1. Copy `server/.env.example` to `server/.env`. Set `GEMINI_API_KEY` for Gemini-generated cases and `MONGODB_URI` for persistence. Without these, the server uses an authored fixture and in-memory storage.
2. Copy `client/.env.example` to `client/.env` if the API URL differs from the default.
3. Install dependencies from the repository root, then in `server/` and `client/`:

   ```sh
   npm install
   cd server && npm install
   cd ../client && npm install
   ```

4. From the root, run `npm run dev`. The client uses port 5173 and the API uses port 5000.
5. Create a fictional scenario of at least 30 characters, or choose the sample case link on the landing page.

### Docker Compose

Copy `server/.env.example` to `server/.env`, add your Gemini key if desired, then run `docker compose up --build`. The client is served at `http://localhost:8080`, the API at `http://localhost:5000`, and MongoDB data is kept in a named volume. This Compose file is for local development; for a public deployment use a managed MongoDB service and set production secrets in the hosting provider.

## Architecture

- `client/`: React, Vite, React Router, responsive case-file interface.
- `server/`: Express API, Zod validation, guest cookie, rate limiting, two-stage Gemini blueprint/evidence generation, recoverable jobs, private/public serializers, deterministic scoring, and Mongoose persistence.
- `render.yaml`: Render Blueprint for the frontend and API.
- `docker-compose.yml`: local client, API, and MongoDB services.
- `server/src/prompts/case-v1.md` and `server/src/prompts/evidence-v1.md`: versioned Gemini prompts.

Gemini requests run only on the server. The backend validates generated case structure and clue references. Invalid output gets one controlled repair attempt, then the job fails safely. A basic content filter rejects common real-person targeting and harmful-content patterns; it is not a substitute for a dedicated moderation provider. If the key is missing, a clearly labelled authored fixture is used. No image provider is configured, so visual evidence is served as labelled text artefacts rather than generated photographs or actual surveillance.

## API overview

- `POST /api/v1/cases` queues case creation; poll `GET /cases/:caseId/status`.
- `GET /api/v1/cases` lists the current guest's saved cases; `DELETE /cases/:caseId` removes an owned case and related progress/job records.
- `GET /api/v1/cases/:caseId`, `/suspects`, `/evidence`, `/timeline`, and `/progress` return player-facing data.
- `PATCH /api/v1/cases/:caseId/progress` saves notes, bookmarks, and reviewed clues.
- `POST /api/v1/cases/:caseId/accusation` accepts one accusation.
- `GET /api/v1/cases/:caseId/reveal` is locked until accusation submission.
- `GET /api/v1/health` reports API and database status.

## Checks

Run `npm test` from the repository root for server and frontend tests. Run `npm run build` to build the frontend.
