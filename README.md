# AI Mystery Room

A MERN detective mystery application. Players create a fictional premise, inspect a case briefing and evidence, compare suspect statements with a timeline, keep notes and bookmarks, make one final accusation, and read an evidence-based reveal.

## Run locally

Requirements: Node.js 20+ and npm. MongoDB is optional for local UI play, but required to preserve cases and progress when the API restarts. If MongoDB is unavailable, the API falls back to memory.

1. Copy `server/.env.example` to `server/.env`. Set `GEMINI_API_KEY` for Gemini generated cases and `MONGODB_URI` for persistence. Without these, the app supports a local fixture mode and stores data in memory. Copy `client/.env.example` to `client/.env` if the API URL differs.
2. Install dependencies from the repository root, then in `server/` and `client/`:

   ```sh
   npm install
   cd server && npm install
   cd ../client && npm install
   ```

3. From the root, run `npm run dev`. The client uses port 5173 and the API uses port 5000.
4. Create a fictional scenario of at least 30 characters, or use the sample case link on the landing page.

### Docker Compose

Copy `server/.env.example` to `server/.env`, add your Gemini key if desired, then run `docker compose up --build`. The client is served at `http://localhost:8080`, the API at `http://localhost:5000`, and MongoDB data is kept in a named volume. This Compose file is a local deployment starting point; use managed, access-controlled MongoDB and object storage for production.

## Architecture

- `client/`: React, Vite, React Router, responsive case-file interface.
- `server/`: Express API, Zod validation, guest cookie, rate limiting, two-stage Gemini blueprint/evidence generation, recoverable jobs, private/public serializers, deterministic scoring, and Mongoose persistence for cases, jobs, and progress.
- `docker-compose.yml`: local client, API, and MongoDB setup.
- `server/src/prompts/case-v1.md`: versioned Gemini case-generation prompt.
- `server/src/routes/api.js`: API routes under `/api/v1`.

Gemini requests run only on the server. The backend validates the returned case shape, difficulty and evidence counts, unique IDs, suspect/evidence references, decisive clue references, incident times, and timestamps. Invalid output gets one controlled repair attempt, then fails the job safely. A basic input/output safety filter rejects common real-person targeting and harmful-content patterns; it is not a substitute for a dedicated moderation provider. If the key is missing, a clearly labelled authored fixture is used. No image provider is configured, so visual evidence is served as labelled text artefacts rather than represented as generated photos or actual surveillance.

## API overview

- `POST /api/v1/cases` queues case creation; poll `GET /cases/:caseId/status`.
- `GET /api/v1/cases` lists the current guest’s saved cases with pagination; `DELETE /cases/:caseId` removes an owned case and its progress/job records.
- `GET /cases/:caseId`, `/suspects`, `/evidence`, `/timeline`, `/progress` return player-facing data.
- `PATCH /cases/:caseId/progress` saves notes, bookmarks, and reviewed clues.
- `POST /cases/:caseId/accusation` accepts one accusation.
- `GET /cases/:caseId/reveal` is locked until accusation submission.

## Current MVP limits

- Guest sessions use HTTP-only cookies; registration and login are deferred as allowed by the MVP spec.
- Without a reachable `MONGODB_URI`, the app falls back to in-memory storage and cases clear when the API restarts.
- The no-key fallback uses one authored case structure; use Gemini for varied cases.
- No generated image or video provider is configured; evidence cards use clearly labelled text alternatives.
- Production deployment, external asset storage, and live provider/database checks require the target hosting configuration and credentials.

## Checks

Run `npm test` from the repository root for server unit/integration tests and frontend interaction tests. Run `npm run build` to build the frontend.
