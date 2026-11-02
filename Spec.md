# AI Mystery Room --- Product & Technical Specification

**Document type:** Single Source of Truth (SSOT) for Codex\
**Version:** 1.0\
**Status:** Build-ready MVP specification\
**Product:** AI Mystery Room\
**Architecture:** MERN (MongoDB, Express, React, Node.js) + Gemini\
**Primary objective:** Turn a user's short fictional scenario into a
coherent, playable detective mystery with AI-generated evidence and a
defensible solution.

------------------------------------------------------------------------

## 1. Product vision

AI Mystery Room is an interactive detective experience. A user submits a
short fictional premise---such as a missing artefact, a locked-room
disappearance, a sabotaged school exhibition, or a mysterious incident
at a hotel. The system expands it into a complete investigation.

The player enters an immersive case room, studies a cast of suspects,
inspects evidence (messages, photographs, CCTV-style material, documents
and witness statements), builds a theory, and accuses one suspect. The
system then reveals the culprit and explains how the evidence supports
the solution.

**Experience principle:** The player should feel like an investigator
solving a fair mystery---not someone guessing what an AI happened to
invent.

### Product pillars

1.  **Fair-play mystery:** The culprit and underlying timeline are fixed
    before evidence is shown. Every important conclusion is supported by
    clues.
2.  **Evidence-led gameplay:** Players inspect, compare, bookmark and
    connect evidence rather than merely reading a story.
3.  **Immersion:** A polished detective case-file aesthetic, restrained
    sound design, purposeful animations and responsive layouts.
4.  **AI creativity with deterministic structure:** Gemini creates the
    case content, while application code validates, stores and serves
    it.
5.  **Replayability:** Different premises produce different cases,
    suspects, evidence and outcomes.

------------------------------------------------------------------------

## 2. Goals and non-goals

### MVP goals

-   Accept a short scenario from the user.
-   Generate one complete mystery containing a setting, incident,
    suspects, timeline, culprit, motive, method, alibis and evidence.
-   Generate varied evidence types: chat/message logs, image evidence,
    CCTV-style evidence, documents and witness statements.
-   Keep the solution and hidden reasoning inaccessible to the player
    until the reveal.
-   Provide an investigation interface with evidence inspection and
    suspect comparison.
-   Let the player submit one final accusation.
-   Show a reveal screen with the culprit, motive, timeline and
    clue-by-clue explanation.
-   Save cases and game progress for authenticated users; support guest
    play if authentication is deferred.
-   Handle AI errors, malformed output, timeouts and content moderation
    gracefully.

### Explicitly out of scope for MVP

-   Multiplayer or co-op investigations.
-   Real-world crime reporting or real-person investigations.
-   User-uploaded real evidence or real-person face analysis.
-   Open-ended AI interrogation that can reveal the answer accidentally.
-   Fully generated, long-form CCTV videos. MVP uses CCTV-style still
    frames, short descriptions, timestamps and/or transcripts. A
    video-generation adapter may be added later.
-   Payments, subscriptions, public leaderboards and social feeds.

------------------------------------------------------------------------

## 3. Target users and core experience

**Primary user:** Someone who enjoys detective stories, escape rooms,
puzzle games and interactive fiction.

**Core loop:** 1. Create a case from a premise. 2. Review the case
briefing. 3. Explore suspects and locations. 4. Open and inspect
evidence. 5. Compare timestamps, statements and contradictions. 6.
Record notes and mark important clues. 7. Make a final accusation with
an optional explanation. 8. View the reveal and performance summary.

A complete case should take approximately 10--20 minutes to solve. Case
difficulty should be selectable: Easy, Medium or Hard.

------------------------------------------------------------------------

## 4. User journeys

### 4.1 Landing page

-   Present the product name, concise premise and strong "Create a Case"
    call to action.
-   Show a short animated evidence-board preview.
-   Explain the loop in three steps: Create → Investigate → Solve.
-   Include a "Try a sample case" option so the user can experience the
    product without writing a premise.
-   Do not expose API keys, prompts or internal AI implementation
    details.

### 4.2 Create a case

Inputs: - **Scenario:** required, 30--1,000 characters. -
**Genre/theme:** optional; examples include campus mystery, museum
mystery, hotel mystery, sci-fi mystery, family-friendly whodunit. -
**Difficulty:** Easy / Medium / Hard; default Medium. - **Evidence
intensity:** Standard / Rich; default Standard. - **Case title
preference:** optional. - A clear note that the user should provide
fictional scenarios and avoid personal or sensitive information.

Validation: - Reject empty or excessively long scenarios. - Show
character count and inline validation. - Moderate the premise before
generation. - Prevent generation from real allegations, requests to
target a real person, or disallowed harmful content. - Show a generation
progress state with meaningful stages, not a frozen spinner.

### 4.3 Case briefing

Display: - Case title and case ID. - Incident summary without revealing
the culprit. - Location and time of incident. - Case difficulty and
estimated solving time. - Number of suspects and evidence items. -
Investigator mission / objective. - "Enter Investigation" button.

### 4.4 Investigation room

Main layout: - **Left navigation rail:** Case Overview, Suspects,
Evidence, Timeline, Notes. - **Main workspace:** selected
suspect/evidence/document. - **Right context panel:** relevant metadata,
tags, related evidence and quick actions. - On smaller screens, panels
become tabs or drawers.

Investigation sections: - **Overview:** incident summary, objective,
case status and progress. - **Suspects:** profile cards with name, role,
public motive, statement and known alibi. Do not show hidden guilt
state. - **Evidence:** searchable/filterable evidence library. Filters:
type, location, suspect, time, reviewed/unreviewed and bookmarked. -
**Timeline:** chronological events visible to the investigator. Clearly
distinguish confirmed facts from statements or uncertain times. -
**Notebook:** private player notes, bookmarked clues and optional theory
summary.

Evidence interactions: - Open an evidence item in a focused
viewer/modal. - Zoom or expand images where supported. - Show source,
timestamp, location, description and reliability label. - Allow
bookmark/unbookmark and mark as reviewed. - Show related evidence
links. - Never show internal fields such as `isCulprit`, hidden
solution, generation prompt or private AI rationale.

### 4.5 Accusation

-   The player selects one suspect.
-   Require a confirmation step to avoid accidental submission.
-   Optional text field: "Why do you believe this person is
    responsible?" (maximum 1,000 characters).
-   The accusation is final for that playthrough. If retry mode is added
    later, it must be explicit.
-   Score based on correctness and investigation quality; do not reward
    random guessing.

### 4.6 Reveal

Show: - Correct culprit. - Whether the accusation was correct. - Motive
and high-level explanation of what happened. - Reconstructed timeline. -
Evidence chain: each decisive clue and what it establishes. -
Contradictions that exposed false statements or alibis. - Player's
bookmarked evidence and notes. - Score and optional rank: Rookie /
Analyst / Master Detective.

The reveal must be understandable and internally consistent. Do not rely
on a clue that was never made available to the player.

------------------------------------------------------------------------

## 5. Mystery design rules

These rules are mandatory for every generated case.

### 5.1 Case structure

Each case must contain: - One clearly defined incident to solve. -
Exactly one culprit for MVP. - 3--5 suspects (minimum 3). - A coherent
setting and bounded time window. - A motive for the culprit. - A
plausible opportunity and means. - A complete canonical timeline. - At
least 8 evidence items for Easy/Medium and 10--12 for Hard. - At least 3
meaningful clues that support the correct solution. - At least 2 red
herrings that are explainable and do not unfairly implicate an innocent
suspect. - At least one contradiction or inconsistency the player can
discover. - A final solution that can be inferred without guessing.

### 5.2 Fairness rules

-   The culprit must be selected before evidence generation.
-   Generate the canonical truth/timeline first; derive every statement
    and evidence item from it.
-   Evidence must not contradict the canonical truth unless the
    contradiction is intentional and explained (for example, a suspect
    lies).
-   Each suspect must have a plausible reason to be considered, but only
    the culprit's evidence chain should fit all confirmed facts.
-   No decisive evidence may appear only in the reveal.
-   Do not make the solution depend on specialist knowledge, obscure
    trivia or arbitrary interpretation.
-   Every red herring must have a fair explanation in the reveal.
-   Avoid impossible timelines, unexplained location changes and
    ambiguous timestamps.
-   Use a consistent timezone and date format throughout a case.
-   Use fictional names, organisations and locations.

### 5.3 Difficulty tuning

  ---------------------------------------------------------------------------
  Difficulty                  Suspects             Evidence Reasoning
  --------------- -------------------- -------------------- -----------------
  Easy                               3                 8--9 Clear clues,
                                                            limited timeline,
                                                            one obvious
                                                            contradiction

  Medium                             4                9--10 Several linked
                                                            clues, plausible
                                                            red herrings,
                                                            timeline
                                                            comparison

  Hard                               5               10--12 Interdependent
                                                            clues, subtle
                                                            contradictions,
                                                            multiple alibis
                                                            to test
  ---------------------------------------------------------------------------

Difficulty changes reasoning complexity, not the fairness of the answer.

------------------------------------------------------------------------

## 6. AI generation architecture

### 6.1 Core principle

Gemini is a content-generation service, not the source of truth at
runtime. The backend owns the canonical case object. The client receives
only the player-safe projection.

Recommended pipeline: 1. Validate and moderate user premise. 2. Ask
Gemini to generate a **case blueprint** as structured JSON. 3. Validate
the blueprint against the schema and mystery rules. 4. If invalid,
request one controlled repair attempt. 5. Generate evidence assets and
text from the accepted blueprint. 6. Validate cross-evidence
consistency. 7. Store the complete canonical case server-side. 8. Return
only the safe case briefing and public content to the client. 9. Reveal
hidden solution only after accusation is submitted.

### 6.2 Gemini integration

-   Use the official Gemini API from the Node.js backend only.
-   Keep the API key in server environment variables. Never expose it in
    React or browser requests.
-   Use a configurable model name through `GEMINI_MODEL`; do not
    hard-code model names across the codebase.
-   Use JSON/structured output where supported and validate every
    response with a runtime schema validator (recommended: Zod).
-   Set request timeouts, bounded retries and rate limits.
-   Log request IDs, latency, token usage if available, validation
    failures and provider errors. Do not log secrets or unnecessary
    personal data.
-   Keep prompts in version-controlled prompt files or a dedicated
    backend prompts directory.
-   Add a provider service abstraction so the model can be changed
    without rewriting game logic.

Suggested service boundary: - `GeminiTextService`: blueprint and text
generation. - `GeminiImageService`: evidence image generation where
supported by the selected model/API. - `EvidenceAssetService`: stores
generated assets and returns application-owned asset URLs. -
`MysteryValidationService`: checks schema, clue fairness and
consistency. - `CaseGenerationService`: orchestrates the pipeline.

**Important MVP implementation decision:** If the selected Gemini model
or API configuration cannot generate an image, do not block case
creation. Use a designed evidence placeholder or a clearly labelled
text-based artefact. Keep image generation behind an adapter so a
compatible image model/provider can be configured later. Do not pretend
a placeholder is a generated photograph.

### 6.3 Evidence generation

Generate evidence only after the canonical blueprint is accepted.

**Message/chat evidence** - Generate fictional conversations with sender
labels, timestamps and message content. - Render in a generic chat
transcript UI inspired by familiar messaging patterns. - Do not copy
WhatsApp logos, proprietary UI assets or claim that messages are
authentic. - Include enough context to interpret the conversation.

**Photographic evidence** - Generate fictional, non-identifiable
scene/object images. - Store image URL, caption, source, timestamp,
location and relevance. - Avoid depicting real people or generating a
real person's likeness. - If image generation fails, provide a labelled
evidence card with a descriptive text alternative.

**CCTV-style evidence** - MVP: generate one or more still frames or a
stylised CCTV panel, timestamp, camera ID, location and observation
summary. - Optional transcript: short description of what can be seen. -
Do not imply a generated still frame is actual surveillance footage. -
Future phase: short AI-generated clips through a separate video provider
adapter.

**Documents** - Generate fictional receipts, access logs, visitor
records, schedules, notes and reports as HTML-rendered artefacts or
downloadable images. - Ensure all document data matches the canonical
timeline.

**Witness statements** - Generate first-person statements from the
blueprint. - Clearly label statements as claims, not confirmed facts. -
Include intentional lies only when the blueprint defines the reason and
the reveal explains them.

### 6.4 Consistency validation

Backend validation must check: - All evidence references valid suspect
IDs, location IDs and timestamps. - Every suspect has a profile and a
statement. - The culprit exists in the suspect list. - Evidence IDs are
unique. - The case has the required evidence count. - The decisive clue
list references evidence actually shown to the player. - The reveal
references only known evidence IDs. - Timeline order and time windows
are valid. - No public object contains the culprit flag or hidden
solution. - Intentional lies and red herrings have explanations. - No
generated asset is referenced before it has been stored successfully.

If validation fails after the repair attempt, mark generation as failed
and show a retry action. Never silently publish a broken mystery.

------------------------------------------------------------------------

## 7. Canonical data contract

Use a versioned case schema. The following is the conceptual contract;
implement it with Mongoose models and Zod validation.

### 7.1 Case

``` json
{
  "schemaVersion": "1.0",
  "title": "The Vanishing Exhibit",
  "premise": "A fictional scenario supplied by the player.",
  "genre": "museum_mystery",
  "difficulty": "medium",
  "status": "ready",
  "setting": {
    "locationName": "A fictional museum",
    "date": "2026-10-14",
    "timezone": "Asia/Kolkata",
    "incidentWindow": {
      "start": "18:00",
      "end": "20:00"
    }
  },
  "incident": {
    "type": "missing_object",
    "summary": "A valuable fictional exhibit has disappeared.",
    "objective": "Determine who took the exhibit and how."
  },
  "suspects": [],
  "timeline": [],
  "evidence": [],
  "solution": {
    "culpritSuspectId": "suspect_03",
    "motive": "Private canonical motive.",
    "method": "Private high-level explanation.",
    "summary": "Private canonical solution.",
    "decisiveEvidenceIds": ["evidence_02", "evidence_07"],
    "redHerringExplanations": [],
    "reveal": "Full player-facing explanation after accusation."
  },
  "generation": {
    "provider": "gemini",
    "model": "configured-model",
    "promptVersion": "case-v1",
    "generatedAt": "ISO_DATE",
    "validationStatus": "passed"
  }
}
```

### 7.2 Suspect

``` json
{
  "id": "suspect_01",
  "name": "Mira Sen",
  "role": "Exhibition coordinator",
  "ageBand": "adult",
  "profile": "Fictional character description.",
  "publicMotive": "A reason investigators might consider this person.",
  "statement": "The suspect's account of the incident.",
  "alibi": "The suspect's claimed whereabouts.",
  "knownFacts": ["Fact visible to the player"],
  "portraitAssetId": null
}
```

Do not expose hidden guilt, private motive details or internal suspicion
scores in the public suspect response.

### 7.3 Timeline event

``` json
{
  "id": "event_01",
  "time": "18:35",
  "description": "A confirmed or claimed event.",
  "locationId": "location_01",
  "relatedSuspectIds": ["suspect_01"],
  "confidence": "confirmed",
  "sourceEvidenceIds": ["evidence_03"]
}
```

`confidence` allowed values: `confirmed`, `claimed`, `uncertain`. The UI
must explain these labels.

### 7.4 Evidence

``` json
{
  "id": "evidence_01",
  "type": "chat",
  "title": "Recovered message thread",
  "description": "A short neutral description.",
  "createdAt": "2026-10-14T18:42:00+05:30",
  "eventTime": "18:42",
  "locationId": "location_01",
  "source": "Fictional device export",
  "reliability": "high",
  "asset": {
    "kind": "text",
    "url": null,
    "mimeType": null,
    "altText": "A fictional message transcript"
  },
  "content": {},
  "relatedSuspectIds": ["suspect_02"],
  "tags": ["communication", "timeline"],
  "playerSummary": "What the player can observe.",
  "internalPurpose": "Private generation/validation note."
}
```

Evidence types: `chat`, `photo`, `cctv`, `document`,
`witness_statement`, `access_log`, `audio_transcript`.

The `internalPurpose` field is server-only and must never be sent to the
browser.

### 7.5 Player progress

``` json
{
  "userId": "USER_ID_OR_GUEST_ID",
  "caseId": "CASE_ID",
  "status": "investigating",
  "reviewedEvidenceIds": [],
  "bookmarkedEvidenceIds": [],
  "notes": "",
  "accusation": {
    "suspectId": null,
    "reason": null,
    "submittedAt": null,
    "isCorrect": null
  },
  "score": null
}
```

### 7.6 Data model recommendations

MongoDB collections: - `users` - `cases` - `playerprogress` -
`generatedassets` (optional if assets are stored in object storage) -
`generationjobs` (recommended for async generation and retry state)

Use indexes: - `cases: { ownerId: 1, createdAt: -1 }` -
`cases: { status: 1, createdAt: -1 }` -
`playerprogress: { userId: 1, caseId: 1 }` unique -
`generationjobs: { status: 1, createdAt: 1 }`

Store large image/video files in object storage, not MongoDB documents.
MongoDB should store asset metadata and URLs.

------------------------------------------------------------------------

## 8. Public/private data boundary

This is a critical anti-spoiler requirement.

### Server-only fields

-   `solution`
-   `culpritSuspectId`
-   hidden motive/method details
-   `internalPurpose`
-   private prompt and model response
-   validation diagnostics
-   any `isCulprit` or equivalent flag

### Player-safe fields

-   case title and briefing
-   suspect public profiles, statements and alibis
-   timeline events that are intended to be discoverable
-   evidence content and metadata
-   player's own notes, bookmarks and progress

Implement explicit serializers/DTOs such as `toPublicCase()` and
`toPublicEvidence()`. Do not return raw Mongoose documents from routes.
Add automated tests that assert secret fields are absent from every
pre-reveal response.

------------------------------------------------------------------------

## 9. Backend API contract

Base path: `/api/v1`

### Authentication

MVP may support guest play. If accounts are implemented: -
`POST /auth/register` - `POST /auth/login` - `POST /auth/logout` -
`GET /auth/me`

Use secure, HTTP-only cookies for session/token transport where
feasible. Hash passwords with bcrypt or Argon2. Never store plain-text
passwords. Add authentication and ownership checks to every private
case/progress endpoint.

### Cases

  Method   Endpoint                  Purpose
  -------- ------------------------- --------------------------------------------
  POST     `/cases`                  Validate premise and create generation job
  GET      `/cases`                  List current user's cases
  GET      `/cases/:caseId`          Get player-safe case briefing
  GET      `/cases/:caseId/status`   Poll generation status
  DELETE   `/cases/:caseId`          Delete owned case

`POST /cases` request:

``` json
{
  "scenario": "A fictional mystery premise...",
  "genre": "campus_mystery",
  "difficulty": "medium",
  "evidenceIntensity": "standard"
}
```

Response:

``` json
{
  "caseId": "CASE_ID",
  "generationJobId": "JOB_ID",
  "status": "queued"
}
```

Generation statuses: `queued`, `validating`, `generating_blueprint`,
`generating_evidence`, `checking_consistency`, `ready`, `failed`.

### Investigation

  ---------------------------------------------------------------------------------------
  Method                  Endpoint                                Purpose
  ----------------------- --------------------------------------- -----------------------
  GET                     `/cases/:caseId/suspects`               Public suspect list

  GET                     `/cases/:caseId/evidence`               Evidence list with
                                                                  filters

  GET                     `/cases/:caseId/evidence/:evidenceId`   One player-safe
                                                                  evidence item

  GET                     `/cases/:caseId/timeline`               Player-visible timeline

  GET                     `/cases/:caseId/progress`               Get player progress

  PATCH                   `/cases/:caseId/progress`               Update notes,
                                                                  bookmarks, reviewed
                                                                  state
  ---------------------------------------------------------------------------------------

### Accusation and reveal

  Method   Endpoint                      Purpose
  -------- ----------------------------- -------------------------------------
  POST     `/cases/:caseId/accusation`   Submit final accusation
  GET      `/cases/:caseId/reveal`       Return reveal only after accusation

Accusation request:

``` json
{
  "suspectId": "suspect_03",
  "reason": "The timestamps and access record do not match the alibi."
}
```

Backend requirements: - Confirm the case is ready and belongs to the
current user. - Confirm the suspect ID exists in that case. - Reject a
second accusation for the same playthrough. - Compare against the
server-only culprit ID. - Calculate score server-side. - Persist the
result. - Return only correctness and a neutral confirmation; reveal
content is served by the reveal endpoint after submission.

### API conventions

-   JSON request/response bodies.
-   Consistent error format:

``` json
{
  "error": {
    "code": "CASE_NOT_READY",
    "message": "This case is still being prepared."
  }
}
```

-   Validate all input on the server.
-   Use pagination for case lists and evidence lists if needed.
-   Add rate limits to case generation, authentication and accusation
    routes.
-   Do not trust user IDs, case ownership or score values supplied by
    the client.

------------------------------------------------------------------------

## 10. Scoring system

MVP scoring (100 points): - Correct culprit: 60 points. - Investigation
coverage: up to 20 points, based on evidence reviewed. - Evidence
reasoning: up to 20 points, based on whether the optional explanation
references meaningful clues.

For the reasoning score, use a transparent, deterministic rubric based
on decisive evidence IDs or clue concepts. Do not let a second
unconstrained LLM call decide the score in an opaque way. If semantic
evaluation is added, cap its contribution and retain a deterministic
baseline.

Suggested ranks: - 0--39: Rookie Investigator - 40--69: Field
Detective - 70--89: Senior Detective - 90--100: Master Detective

A correct accusation should always be clearly distinguished from the
quality score.

------------------------------------------------------------------------

## 11. Visual design system

### 11.1 Art direction

**Theme:** Modern detective archive / premium investigation workstation.

The interface should feel cinematic, intelligent and tactile---not like
a generic admin dashboard and not like a horror game.

Visual cues: - Deep charcoal / midnight navy backgrounds. - Warm paper
and muted ivory surfaces for documents. - Brass/amber accents for
highlights and active evidence. - Muted teal for verified information. -
Restrained crimson only for alerts or contradictions. - Fine borders,
subtle grain, soft shadows and evidence-card layering. - Clear
typography: a distinctive display face for headings and a highly
readable sans-serif for body/UI text. Use a mono font for timestamps,
case IDs and technical metadata.

Suggested tokens:

``` css
:root {
  --bg: #10151c;
  --surface: #19212b;
  --surface-raised: #222d39;
  --paper: #eee8da;
  --paper-muted: #d8d0c0;
  --text-primary: #f4f1e9;
  --text-secondary: #aab3bd;
  --ink: #1d252d;
  --accent: #c69a52;
  --verified: #6eaa9a;
  --warning: #c96f68;
  --border: rgba(238, 232, 218, 0.14);
}
```

These are starting tokens; maintain contrast and accessibility.

### 11.2 Core components

-   `CaseHeader`
-   `CaseProgress`
-   `InvestigationSidebar`
-   `SuspectCard`
-   `SuspectProfilePanel`
-   `EvidenceCard`
-   `EvidenceViewer`
-   `EvidenceFilterBar`
-   `Timeline`
-   `TimelineEvent`
-   `NotebookPanel`
-   `BookmarkButton`
-   `AccusationDialog`
-   `RevealReport`
-   `GenerationProgress`
-   `EmptyState`
-   `ErrorState`
-   `Toast`

### 11.3 Signature interactions

-   Evidence cards subtly lift on hover/focus.
-   Opening evidence uses a smooth, short transition.
-   Bookmarked evidence gets a visible pin/marker.
-   Timeline events can link to their source evidence.
-   Suspect profiles show public facts and alibis in a dossier format.
-   A visual "case board" may connect selected evidence cards, but it
    must not automatically reveal the answer.
-   Add a restrained ambient sound toggle only if it can be muted and
    does not autoplay.
-   Respect `prefers-reduced-motion`.

### 11.4 Responsive behavior

-   Desktop: three-column investigation workspace.
-   Tablet: two-column layout with collapsible context panel.
-   Mobile: single-column navigation with bottom/tab navigation and
    full-screen evidence viewer.
-   No horizontal overflow at 320px viewport width.
-   All actions must be keyboard accessible.

### 11.5 Accessibility

-   WCAG AA contrast target.
-   Visible focus states.
-   Semantic headings and buttons.
-   Keyboard-accessible dialogs and filters.
-   Alt text for every generated image.
-   Do not use colour alone to communicate evidence reliability or
    correctness.
-   Captions/transcripts for audio/video if introduced.

------------------------------------------------------------------------

## 12. Frontend architecture

Recommended structure:

``` text
client/
  src/
    app/
      router/
      providers/
    components/
      layout/
      common/
      evidence/
      suspects/
      timeline/
      notebook/
    features/
      auth/
      cases/
      investigation/
      accusation/
      reveal/
    hooks/
    lib/
      apiClient.js
      validators.js
    styles/
      tokens.css
      global.css
    pages/
      LandingPage.jsx
      CreateCasePage.jsx
      CaseBriefingPage.jsx
      InvestigationPage.jsx
      RevealPage.jsx
```

Frontend requirements: - React with React Router. - Use a consistent
data-fetching strategy (TanStack Query recommended). - Central API
client with credentials, error handling and request cancellation. - Keep
server data separate from local UI state. - Persist notes/bookmarks
through backend progress endpoints. - Show loading, empty, error and
retry states for every data-driven screen. - Never include Gemini API
credentials or prompts in the client bundle. - Avoid placing the full
hidden case object in browser state, local storage or network responses.

------------------------------------------------------------------------

## 13. Backend architecture

Recommended structure:

``` text
server/
  src/
    config/
    models/
    routes/
    controllers/
    services/
      ai/
      case/
      evidence/
      scoring/
      storage/
    middleware/
    validators/
    prompts/
    serializers/
    jobs/
    utils/
    app.js
    server.js
```

Recommended packages: - `express` - `mongoose` - `cors` - `helmet` -
`express-rate-limit` - `zod` - official Google GenAI SDK (use the
currently supported official package) - `dotenv` - `bcrypt` or `argon2`
if password authentication is implemented - `cookie-parser` if
cookie-based auth is implemented - `pino` or another structured logger -
test stack: `vitest` or `jest`, plus `supertest`

Use a job-based generation flow rather than holding an HTTP request open
while multiple AI assets are generated. For MVP, a database-backed job
worker is acceptable; a dedicated queue can be introduced later.

------------------------------------------------------------------------

## 14. Security, privacy and content safety

-   Treat all user scenarios as untrusted input.
-   Moderate user premises and generated output.
-   Keep the product fictional; do not facilitate accusations against
    real people.
-   Reject requests to generate targeted allegations, impersonation,
    private personal data or real-person surveillance.
-   Do not generate identifiable likenesses of real people.
-   Avoid graphic violence, sexual content, self-harm content and
    instructions for real-world wrongdoing.
-   Use fictional names, fictional organisations and fictional places by
    default.
-   Store only necessary account and gameplay data.
-   Apply ownership checks to all case and progress endpoints.
-   Use secure headers, rate limiting, input validation and safe error
    messages.
-   Restrict CORS to configured frontend origins.
-   Keep secrets in environment variables and out of logs.
-   Sanitize rendered user- and AI-generated text to prevent XSS.
-   Validate asset MIME types and size limits.
-   Use signed or access-controlled asset URLs if cases are private.
-   Provide a way to delete a user's cases and associated assets.

------------------------------------------------------------------------

## 15. Environment configuration

Create `.env.example` files. Never commit real secrets.

Server:

``` env
NODE_ENV=development
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/ai_mystery_room
GEMINI_API_KEY=
GEMINI_MODEL=
SESSION_SECRET=
ASSET_STORAGE_PROVIDER=local
ASSET_STORAGE_PATH=./uploads
MAX_CASE_GENERATIONS_PER_HOUR=5
```

Client:

``` env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

For production, use managed MongoDB and object storage. Do not use local
filesystem storage for production assets unless the hosting environment
guarantees persistence.

------------------------------------------------------------------------

## 16. Error handling and resilience

Handle at minimum: - Empty/invalid premise. - Premise rejected by
moderation. - Gemini rate limit or quota exhaustion. - Gemini
timeout/network failure. - Invalid JSON or schema mismatch. -
Inconsistent mystery after generation. - Image generation failure. -
Asset upload failure. - Case not ready. - Case not found or not owned by
user. - Duplicate accusation. - Expired session. - Database unavailable.

User-facing errors should be calm and actionable. Never show raw stack
traces, provider secrets or internal prompts.

Generation retry rules: - Retry transient provider failures a small
bounded number of times with backoff. - Do not retry content-policy
rejections as if they were network errors. - If optional image
generation fails, continue with a labelled fallback. - If canonical
blueprint or consistency validation fails, fail the job rather than
publish an unfair case.

------------------------------------------------------------------------

## 17. Testing strategy

### Unit tests

-   Scenario validation.
-   Difficulty-to-suspect/evidence count mapping.
-   Zod schemas.
-   Mystery consistency validator.
-   Public/private serializers.
-   Score calculation.
-   Accusation validation.

### Integration tests

-   Create case → generation job → ready state.
-   Fetch case and verify hidden solution is absent.
-   Fetch evidence and verify private fields are absent.
-   Update notes/bookmarks.
-   Submit accusation and verify server-side correctness.
-   Reveal endpoint denied before accusation and allowed afterward.
-   Ownership checks across users/guests.
-   AI failure and retry behavior.

### Frontend tests

-   Landing and case creation validation.
-   Generation progress states.
-   Evidence filtering and viewer interactions.
-   Suspect selection and accusation confirmation.
-   Reveal display.
-   Responsive navigation and keyboard interaction.

### End-to-end acceptance scenarios

1.  A user submits a valid fictional premise and receives a ready case.
2.  The generated case has 3--5 suspects and the required evidence count
    for its difficulty.
3.  The player can inspect all evidence and bookmark clues.
4.  The player can compare suspect statements with the timeline.
5.  The player cannot discover the culprit from API responses or browser
    state before accusation.
6.  A valid accusation is saved exactly once.
7.  The reveal correctly explains the solution using evidence the player
    saw.
8.  If image generation fails, the case remains playable with clear
    fallback cards.
9.  A failed or invalid case is never shown as ready.
10. The application works on desktop, tablet and mobile.

------------------------------------------------------------------------

## 18. Performance and quality targets

-   Landing page should become interactive quickly on a typical
    broadband connection.
-   Normal API reads should generally complete within 500 ms excluding
    network variability.
-   Case generation is asynchronous and must show progress; do not
    promise a fixed generation time.
-   Paginate case history and large evidence collections.
-   Lazy-load evidence images.
-   Use thumbnails in evidence grids and full-size assets only in the
    viewer.
-   Avoid regenerating a case on every page refresh.
-   Cache safe, immutable case content where appropriate.
-   Track generation success rate, average generation duration, schema
    failure rate and asset failure rate.

------------------------------------------------------------------------

## 19. Analytics and product events

Track minimal, privacy-conscious events: - `case_creation_started` -
`case_generation_succeeded` - `case_generation_failed` - `case_opened` -
`evidence_opened` - `evidence_bookmarked` - `timeline_opened` -
`accusation_submitted` - `reveal_opened`

Useful product metrics: - Case generation success rate. - Percentage of
cases reaching an accusation. - Median time to solve. - Evidence review
rate. - Correct accusation rate by difficulty. - Most frequently opened
evidence types. - User retry rate after a failed generation.

Do not send scenario text, private notes or hidden solutions to
third-party analytics.

------------------------------------------------------------------------

## 20. Build phases

### Phase 1 --- Foundation

-   MERN project setup.
-   Environment configuration.
-   MongoDB models.
-   API client and routing.
-   Landing page and design tokens.
-   Guest session or basic authentication.

### Phase 2 --- Case generation

-   Gemini service abstraction.
-   Prompt templates.
-   Structured blueprint generation.
-   Schema validation and repair attempt.
-   Async generation job and status endpoint.
-   Store canonical case securely.

### Phase 3 --- Evidence and investigation

-   Generate text evidence and optional image assets.
-   Evidence library and viewer.
-   Suspect dossiers.
-   Timeline.
-   Notes, bookmarks and reviewed state.

### Phase 4 --- Accusation and reveal

-   Accusation flow.
-   Server-side scoring.
-   Reveal report and evidence chain.
-   Spoiler-boundary tests.

### Phase 5 --- Polish and release

-   Responsive design.
-   Accessibility.
-   Loading/error/empty states.
-   Security review.
-   Automated tests.
-   Deployment configuration and README.

**Build priority:** A complete, fair, end-to-end playable mystery is
more important than adding many evidence formats. If time is limited,
ship text chat logs, documents, witness statements, timeline and
CCTV-style still cards before attempting generated video.

------------------------------------------------------------------------

## 21. Definition of Done

The MVP is complete only when: - A user can submit a fictional scenario
and generate a complete case. - The case has one fixed culprit and a
coherent canonical timeline. - Every suspect and evidence item is linked
to the same canonical case. - Evidence is varied, inspectable and useful
for reasoning. - The case passes automated schema and consistency checks
before becoming playable. - The client cannot access the hidden solution
before accusation. - The user can take notes, bookmark and review
evidence. - The user can submit one accusation. - The reveal explains
the solution using previously available evidence. - Generation and asset
failures have graceful fallbacks. - The experience is responsive,
accessible and visually consistent. - Setup instructions,
`.env.example`, scripts and tests are included in the repository.

------------------------------------------------------------------------

## 22. Codex implementation instructions

Treat this document as the authoritative product and technical contract.

1.  Read this entire specification before changing or creating files.
2.  Inspect the existing repository first. Preserve working code and
    conventions where possible.
3.  If the repository is empty, create the `client/` and `server/`
    structure described above.
4.  Implement in the build phases in order. Do not jump directly to
    decorative UI while core case generation and data boundaries are
    missing.
5.  Use JavaScript throughout unless the repository already uses
    TypeScript. Keep naming and patterns consistent.
6.  Define and validate shared data contracts before wiring UI
    components.
7.  Keep Gemini calls on the backend. Read credentials only from
    environment variables.
8.  Store the canonical solution server-side and create explicit
    player-safe DTOs.
9.  Never send raw canonical case documents to the frontend.
10. Use mock fixtures during UI development, but clearly separate mocks
    from production AI services.
11. Do not invent unsupported API capabilities. If an image/video
    capability is unavailable, use the specified fallback and keep the
    provider behind an adapter.
12. Write tests for schema validation, spoiler protection, scoring and
    the full accusation/reveal flow.
13. Keep the README updated with setup, environment variables, scripts,
    architecture and known limitations.
14. After each phase, run linting and tests, fix failures, and report
    what is complete and what remains.
15. Do not silently omit requirements. If a requirement cannot be
    implemented, document the reason and the fallback.

### Required repository deliverables

-   Working MERN application.
-   `.env.example` for client/server as appropriate.
-   MongoDB models and validation schemas.
-   Versioned Gemini prompts.
-   AI provider/service abstraction.
-   Case generation job flow.
-   Player-safe serializers.
-   Responsive investigation UI.
-   Unit, integration and end-to-end tests for critical flows.
-   README with local setup and deployment notes.

**Final product standard:** It should feel like opening a beautifully
designed detective case file, uncovering a trail of clues, and earning
the reveal through reasoning. The mystery must be fair, the interface
immersive, and the hidden answer technically protected.
