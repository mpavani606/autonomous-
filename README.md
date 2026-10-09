# Autonomous Study Planner – Agentic Learning Assistant

An agent-first learning assistant prototype built with the MERN stack. A learner gives the agent a goal; the agent analyzes available context, reasons over concept dependencies, proposes next actions, and adapts recommendations from progress signals. This is not an LMS: it does not host courses, manage enrollments, or provide teacher/classroom workflows.

## 1. Project Architecture

### Frontend
- React + Vite
- React Router DOM
- Recharts
- CSS-based premium glassmorphism UI
- Context-based auth state
- Custom hooks for dashboard data and AI chat

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT auth
- Rate limiting, helmet, CORS, validation-ready middleware
- Agentic orchestration layer and demo AI services

### Core product capabilities (demo scope)
- Goal intake and agent mission setup
- Agent-generated next actions and adaptive roadmap
- Knowledge graph used as agent reasoning context
- Note summarization and concept extraction for agent context
- Conversational agent explanations and recommendations
- Progress signals to inform the next planning cycle
- Admin monitoring of representative demo metrics

The main demo flows are connected: onboarding saves each learner's mission and proposed plan, Agent Notes stores analyzed notes, and practice feedback is retained as explicitly learner-reported data. The knowledge map and learner dashboard still use representative demo data; admin metrics are calculated from saved database records. AI responses use local demo reasoning unless a model provider is configured. The current prototype proposes and organizes actions; it does not independently execute external actions or host learning content.

## 2. Frontend Structure

```text
client/
  src/
    assets/
    components/
      AppLayout.jsx
      ProtectedRoute.jsx
      StatCard.jsx
    context/
    hooks/
    pages/
      AdminPage.jsx
      AIMentorPage.jsx
      AINotesPage.jsx
      AnalyticsPage.jsx
      DashboardPage.jsx
      LandingPage.jsx
      LoginPage.jsx
      OnboardingPage.jsx
      PracticePage.jsx
      ProfilePage.jsx
      RegisterPage.jsx
      StudyPlanPage.jsx
    services/
    App.jsx
    index.css
    main.jsx
```

### Key frontend modules
- Landing page: introduces the autonomous, goal-driven learning agent
- Login/Register: authentication entry flows
- Mission setup: goal, time budget, existing knowledge, and learning preferences
- Agent Command Center: proposed next actions, reasoning signals, and context
- Mission Plan: generated roadmap and recommended actions
- Knowledge Map: concepts and prerequisite relationships used by the agent
- Agent Notes: summarized context and extracted concepts
- Agent Conversation: chat-based explanations and recommendations
- Learning Signals: representative performance charts
- Profile + Admin: account information and demo monitoring

Shared navigation/layout and route protection live in `components/`. Route-level views live in `pages/`, with API state and persistence behavior kept in `hooks/` and API access centralized in `services/`.

## 3. Backend Structure

```text
server/
  app.js
  agents/
  config/
  controllers/
  middleware/
  models/
  routes/
    index.js
  services/
  utils/
  index.js
```

### Backend responsibilities
- app.js: Express middleware and API app configuration
- index.js: MongoDB initialization and HTTP server startup
- routes/index.js: API route registration, liveness, and database readiness endpoints
- authController.js: registration, login, JWT flow
- goalController.js: onboarding/goal analysis
- planController.js: plan generation
- knowledgeController.js: concept graph endpoints
- notesController.js: AI notes API
- mentorController.js: AI mentor chat API
- progressController.js: analytics endpoint
- adminController.js: system monitoring stats
- agents/agentOrchestrator.js: delegates goal planning and mentor requests to agent services
- services/: AI reasoning and study-plan generation logic
- config/: environment and database connection setup

## 4. Major Modules

### 4.1 Landing & Product Experience
Purpose:
- Introduce the product as a goal-driven AI learning agent, not a course-delivery or classroom-management system.

Architecture:
- Agent-first hero with setup/login calls to action and an optional spoken welcome
- Four-step overview explaining goal intake, agent reasoning, recommended actions, and feedback
- Learning-agent workflow diagrams, capability cards, and mission statement
- Mission setup, action recommendations, knowledge context, and progress signals are provided in authenticated workbench pages, not by the landing page itself
- The authenticated command center presents the active mission, proposed plan actions, plan rationale, and lowest-mastery context; dashboard charts remain representative demo data
- Uses glassmorphism styling; the current demo proposes and organizes learning actions but does not autonomously execute external actions

### 4.2 Authentication
Purpose:
- Secure access to protected routes and profile data.

Routes:
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

Registration offers Student and Admin roles. Initial admin signup requires a server-only `ADMIN_SIGNUP_CODE`; an authenticated administrator can create additional admins from `/admin/dashboard`. Both roles use the same `/login` page, which routes to the appropriate dashboard based on the account role. Admin APIs require a valid administrator token. Passwords are hashed, login and registration are rate-limited, and the client revalidates saved sessions with `/api/auth/me`. Authentication requires MongoDB and reports a service-unavailable error when it cannot connect; it does not issue demo credentials.

### 4.3 Onboarding / Goal Engine
Purpose:
- Capture learning goals, study constraints, current skill level, and preferred learning style.

Flow:
- Collect a goal/domain, available hours, skill level, target date, study-time preference, existing knowledge, and preferred learning approach
- Accept optional learner-reported focus topics; the demo does not claim to detect skill gaps from live assessments
- Validate the mission and prepare a bounded set of proposed review, practice, and knowledge-check actions
- Persist the generated goal, plan, proposed tasks, and learner profile updates in MongoDB

### 4.4 Autonomous Study Planner Agent
Purpose:
- Turn a learner-provided mission into an ordered set of review, practice, and knowledge-check recommendations.

Agent flow:
- Validate goal, domain, time budget, skill level, and learner-provided context
- Match a learner-reported focus topic against the available demo knowledge graph
- Order known prerequisite concepts before the focus concept when graph relationships exist
- Skip prerequisite review when the learner reports that they already know the concept
- Bound each proposed action by the available daily study-time budget
- Show mission milestones and the rationale/context used to prepare the recommendations

Planning uses a fixed representative graph and does not infer skill gaps from assessment performance. If a focus topic does not match a graph concept, the agent proposes a general review/practice/check sequence. Scores explicitly submitted through the Practice page are stored as learner-reported feedback and can inform the next suggested plan; they are not verified quiz or assessment results. All generated actions are recommendations for the learner to review, not actions the agent executes.

### 4.5 Knowledge Graph
Purpose:
- Represent concept dependency chains such as JavaScript -> Functions -> Promises -> Async/Await.

Concept nodes expose `conceptId`, `name`, `subject`, `difficulty`, prerequisite and related-concept IDs, mastery and confidence scores, last-studied date, and next-revision date.

Relationships:
- PREREQUISITE_OF
- RELATED_TO
- DEPENDS_ON
- MASTERED
- WEAK_IN

The current map is a representative demo graph returned by the protected `/api/knowledge-graph/graph` and `/api/knowledge-graph/concepts` endpoints. Its mastery, confidence, dates, and learner-status relationships are illustrative rather than live user records. The planner uses matching concept and prerequisite links as context; unmatched focus topics receive a general suggested sequence.

### 4.6 Agentic Note Taking
Purpose:
- Turn raw notes into summaries, key concepts, flashcards, and quiz-friendly material.

Feature behavior:
- Summarize submitted text and extract recognized concepts, key sentences, definition-shaped sentences, and flashcards
- Link concepts that match the representative knowledge graph and expose graph relationships between matched concepts
- List graph prerequisites not mentioned in the submitted note as review prompts; absence from the note is not treated as evidence of a learner knowledge gap
- Validate note title and text length before analysis

Newly analyzed notes and their extracted context are stored in MongoDB per authenticated learner. The graph remains representative demo data, not a user-specific graph. Text extraction is local and pattern-based unless an AI summary provider is configured; it does not infer definitions or missing knowledge beyond the submitted text and available graph links.
### 4.7 AI Mentor
Purpose:
- Answer concept questions and help the learner review proposed actions using the active mission and available agent context.

Examples:
- Explain React useEffect
- Why did I mark SQL joins as a focus topic?
- What should I study next from my proposed plan?

The mentor receives bounded mission fields, proposed action summaries, graph concept labels/scores, and extracted note concept labels—not raw note text. Graph scores are representative demo signals, not live learner assessments. Without `OPENAI_API_KEY`, replies use local demo reasoning; API failures are reported or identified as a local fallback. Recommendations remain suggestions and are not executed by the agent.

### 4.8 Adaptive Learning Engine
Purpose:
- Use explicit learner-submitted practice scores to revise proposed actions for the active mission.

Examples:
- For a score below 60%, or a decrease of at least 10 points from the last server-stored score for that concept, suggest focused revision, practice, and a follow-up check before broader tasks
- For scores from 60% to 79%, suggest a short reinforcement review and another knowledge check
- For scores of 80% or higher, suggest progression to a directly linked next concept when the demo graph has one
- Show the latest submitted signal and the adjusted recommendations for learner review

Feedback is self-reported, not a verified assessment. Feedback scores are stored as `Assessment` records scoped to the authenticated learner, and the revised plan is stored with its proposed tasks. The learner chooses whether to follow any recommendation; submitted scores do not trigger automatic replanning outside the feedback request.
### 4.9 Analytics Dashboard
Purpose:
- Present available progress signals and agent recommendations while distinguishing learner-submitted feedback from representative demo metrics.

Dashboard signals:
- Overall mastery, quiz accuracy, completion rate, study streak, and study hours are served as representative demo analytics
- Concept mastery is shown from the representative demo knowledge graph
- Self-reported practice scores are plotted from server-stored feedback for the signed-in account
- The active plan's reasoning and proposed next actions are shown for learner review
- If progress data cannot be loaded, the error is surfaced; fabricated metrics are not substituted

Submitted practice scores remain self-reported, not verified assessment results. When a learner has submitted scores, analytics show their latest scores by concept separately from quiz accuracy, study sessions, and other signals that are not yet collected. If the learner has no persisted progress records, the API identifies its representative demo analytics as such.

## 5. API Endpoints

All endpoints are prefixed with `/api`. Except `GET /api/health`, authentication endpoints, and routes explicitly noted below, requests require `Authorization: Bearer <token>`. Send JSON request bodies with `Content-Type: application/json`.

Authentication failures return `401`; role authorization failures return `403`; request validation failures return `400`. API/service failures use a JSON `message` field. Most feature endpoints return `{ "success": true, "data": ... }`; auth endpoints return their user/token fields directly.

### Health
- `GET /api/health` — public API liveness check; returns `{ "status": "healthy", "message": "..." }`.

### Auth
- `POST /api/auth/register` — public; body: `{ "name": "A Learner", "email": "learner@example.com", "password": "at-least-8-characters", "role": "student" }`; role defaults to `student`. Initial `admin` registration also requires `adminSignupCode` matching the private server `ADMIN_SIGNUP_CODE`. Returns `201` with `{ "token", "user" }`. Registration is rate-limited.
- `POST /api/auth/login` — public; body: `{ "email", "password" }`; returns `{ "token", "user" }`. Login is rate-limited. Both endpoints return `503` when MongoDB is unavailable; demo credentials are not issued.
- `GET /api/auth/me` — bearer token required; returns `{ "user": { "id", "name", "email", "role" } }`.

### Dashboard and goals
- `GET /api/dashboard` — bearer token required; returns representative dashboard fixture data, not live learner records.
- `POST /api/goals/analyze` — bearer token required; body requires `goal` (max 160 chars), `exam` (max 100), `hoursPerDay` (number, 0.5–16), `skillLevel` (max 40), `preferredStudyTime` (max 40), and `learningStyle` (max 80). Optional: `weakArea` (max 100), `existingKnowledge` (max 1,000), and `targetDate` (`YYYY-MM-DD`, today or later). Returns `{ "success": true, "data": { "agent", "type", "result", "summary" } }`; saves the goal, active plan, and proposed tasks for the authenticated user, and updates their onboarding profile. Returns `503` if MongoDB is unavailable.

### Study plans
- `GET /api/study-plans` — bearer token required; returns the authenticated learner's active plan and populated proposed tasks, or an empty `data` array when none exists.
- `POST /api/study-plans/generate` — bearer token required; creates and saves a plan from optional mission fields (`goal`, `exam`, `hoursPerDay`, `weakArea`, `skillLevel`, `preferredStudyTime`, `targetDate`, `existingKnowledge`, `learningStyle`). `hoursPerDay`, when supplied, must be a number from 0.5 to 16; text limits and target-date rules match `/api/goals/analyze`. Returns `201` with `{ "success": true, "data": plan }`. Prior active plans are paused for that learner. Returns `503` if MongoDB is unavailable.

### Knowledge graph
- `GET /api/knowledge-graph/graph` — bearer token required; returns the representative graph `{ "nodes": [...], "edges": [...] }`.
- `GET /api/knowledge-graph/concepts` — bearer token required; returns representative concept nodes and their metadata. Graph mastery, confidence, and review dates are illustrative.

### Notes
- `GET /api/notes` — bearer token required; returns only the authenticated learner's saved notes and analysis.
- `POST /api/notes` — bearer token required; body requires `title` (1–120 chars) and `content` (1–12,000 chars); returns `201` with the persisted note analysis, extracted concepts, key points, definitions, flashcards, graph links, and prerequisite review prompts. Returns `503` if MongoDB is unavailable.

### AI mentor
- `POST /api/ai/ask` — bearer token required; body: `{ "question": "...", "context": { "mission": {...}, "nextActions": [...], "graphConcepts": [...], "noteConcepts": [...] } }`; question limit: 2,000 chars. Returns `{ "success": true, "data": { "question", "answer", "mode" } }`. Context is bounded and excludes raw note text. `mode` identifies configured-model, local-demo, or local-fallback output. The configured model is instructed to answer each question directly and in order. Local demo mode answers only supported topics and explicitly declines unsupported or multi-part questions rather than guessing.

### Progress
- `GET /api/progress` — bearer token required; returns persisted learner-reported assessment scores when available, otherwise persisted progress records, otherwise representative analytics (`source: "representative-demo"`). It does not present submitted feedback as verified quiz or session data.
- `POST /api/progress/feedback` — bearer token required; body: `{ "concept": "...", "score": 0 }`; score must be a whole number from 0–100 and an active mission must exist. The server uses the previous score stored for that learner and returns the revised saved plan plus the newly stored learner-reported `Assessment`. Returns `503` if MongoDB is unavailable.

### Admin
- `GET /api/admin/stats` — bearer token with the `admin` role required; returns live counts and average learner-reported scores from MongoDB.
- `GET /api/admin/admins` — bearer token with the `admin` role required; returns the administrator account directory without password fields.
- `POST /api/admin/admins` — bearer token with the `admin` role required; body: `{ "name": "A New Admin", "email": "admin@example.com", "password": "at-least-8-characters" }`; creates an additional admin account.

## 6. Database Schema Overview

The Mongoose models below describe the intended MongoDB document shapes. Unless marked required, fields are optional. Fields with defaults receive those values when a document is created; every model has `createdAt` and `updatedAt` timestamps.

### User
- `name`, `email`, `password` — required strings; name is trimmed, email is lowercased and unique
- `role` — `student | mentor | admin`, default `student`
- `skillLevel` — string, default `Beginner`
- `hoursPerDay` — number, default `2`
- `preferredStudyTime` — string, default `Evening`
- `goalSummary` — string
- `targetCompletionDate` — date
- `learningStyle` — string, default `Self-paced`
- `onboardingCompleted` — boolean, default `false`

### Goal
- `user` — required reference to `User`
- `title` — required string
- `exam`, `weakArea`, `skillLevel`, `learningStyle`, `existingKnowledge`, `summary` — strings
- `availableHoursPerDay` — number
- `targetDate` — date

### StudyPlan
- `user` — required reference to `User`
- `goalId` — reference to `Goal`
- `title` — required string
- `summary` — string
- `milestones`, `adaptiveReasoning` — arrays of strings
- `tasks` — array of references to `StudyTask`
- `exam`, `weakArea`, `skillLevel`, `preferredStudyTime`, `targetDate`, `existingKnowledge`, `learningStyle`, `timeline` — strings
- `hoursPerDay` — number
- `missionContext`, `knowledgeGraph` — mixed structured objects retaining the generated planning context
- `status` — `active | paused | completed`, default `active`

### StudyTask
- `user` — reference to `User`; `plan` — reference to `StudyPlan`
- `title` — required string; `description`, `concept`, `day` — strings
- `type` — `revision | practice | assessment | mock-test`, default `practice`
- `dueDate` — date
- `status` — `scheduled | in_progress | completed`, default `scheduled`
- `estimatedHours` — number, default `1`

### Concept
- `user` — reference to `User`
- `conceptId`, `name`, `subject` — required strings
- `difficulty` — string, default `beginner`
- `prerequisites`, `relatedConcepts` — arrays of concept ID strings
- `masteryScore`, `confidenceScore` — numbers, default `0`
- `lastStudied`, `nextRevision` — dates

### KnowledgeEdge
- `user` — reference to `User`
- `source`, `target` — required concept ID strings
- `relationship` — required `PREREQUISITE_OF | RELATED_TO | DEPENDS_ON | MASTERED | WEAK_IN`

### Note
- `user` — reference to `User`
- `title`, `content` — required strings; `summary` — string
- `concepts`, `tags`, `keyPoints` — arrays of strings
- `definitions`, `flashcards`, `missingPrerequisites` — arrays of analyzed note material
- `graphLinks` — mixed graph-link data
- `sourceType` — `text | pdf | upload | lecture`, default `text`

### Flashcard
- `user` — reference to `User`
- `question`, `answer` — required strings; `concept` — string
- `mastered` — boolean, default `false`

### Quiz
- `user` — reference to `User`
- `title` — required string; `concept` — string
- `score`, `totalQuestions` — numbers, default `0`
- `completedAt` — date

### Progress
- `user` — required reference to `User`
- `overallMastery`, `studyHours`, `streak`, `completionRate`, `quizAccuracy` — numbers, default `0`
- `weakAreas`, `strongAreas` — arrays of strings

### Reminder
- `user` — required reference to `User`
- `title` — required string; `message` — string
- `scheduledFor` — date
- `completed` — boolean, default `false`

### Notification
- `user` — required reference to `User`
- `title` — required string; `message` — string
- `category` — string, default `info`
- `read` — boolean, default `false`

### AIRecommendation
- `user` — required reference to `User`
- `type` — string, default `study`
- `title`, `description` — strings
- `priority` — `low | medium | high`, default `medium`

### StudySession
- `user` — reference to `User`
- `sessionType` — `plan | revision | practice | mock-test`, default `practice`
- `durationMinutes` — number
- `notes` — string
- `performance` — number, default `0`

### Assessment
- `user` — reference to `User`
- `concept`, `summary` — strings
- `score`, `confidence` — numbers, default `0`

The schemas are defined and exported by `server/models/index.js`. Goal analysis and generated plans/tasks, analyzed notes, and learner-submitted feedback are persisted and scoped to the authenticated user. Plans and notes load from MongoDB; the browser keeps only a per-account plan cache for responsiveness. Knowledge graph and admin responses remain representative fixtures. Progress uses saved self-reported assessments when present, but quiz accuracy, study sessions, and verified assessment records are not yet collected. APIs requiring learner persistence return `503` when MongoDB is unavailable rather than silently falling back to browser-only writes.

## 7. Frontend Integration

### API client
- `client/src/services/api.js` centralizes Axios requests, applies a 10-second timeout, and attaches the saved bearer token to API calls.
- Set the client environment variable `VITE_API_URL` to the API base URL, including the `/api` prefix (for example, `http://localhost:5000/api`). When unset, the client uses that local development URL.
- A `401` from a protected endpoint clears the saved session and signals the auth context to return the learner to sign-in. Failed login and registration responses do not invalidate a previously saved session.

### Authentication and routing
- `AuthProvider` stores the current user and token in browser local storage and revalidates saved tokens with `GET /api/auth/me` on startup.
- Login and registration submit through the shared API client; logout or an invalidated session clears both stored auth values.
- `BrowserRouter` provides the public landing, login, and registration routes. `ProtectedRoute` waits for session validation before rendering authenticated workbench routes.
- The admin page checks the user's role for its UI, and the backend independently authorizes admin API access.

### Data hooks and pages
- `useStudyPlan` loads the signed-in learner's active plan from the API; it uses an account-scoped browser cache while loading and refreshes that cache from the server response.
- `useNotes`, `useProgress`, `useKnowledgeGraph`, and `useAIChat` connect notes, progress, graph, and mentor requests to their respective APIs. Request failures are surfaced to the page instead of being replaced with successful-looking sample results.
- The dashboard composes these hooks rather than fetching a separate dashboard API. Its notifications area remains empty until a notifications endpoint is implemented.
- Knowledge graph values and analytics without learner records are clearly identified representative demo data. Notes, plans, and submitted feedback are loaded from user-scoped server records.

## 8. Testing Instructions

Run these checks from the project root after installing dependencies:

### Frontend production build
```bash
npm run build
```

### Frontend lint
```bash
npm run lint
```

### Backend tests
```bash
npm test
```

The backend suite uses Node's built-in test runner and does not require a database. It covers public health, authentication enforcement, validation responses, and representative plan/adaptation behavior. Persistence success paths require a configured MongoDB instance and are not exercised by this offline suite.

### Backend entry-point syntax check
```bash
node --check server/index.js
```

### Run backend in development
```bash
npm run dev --prefix server
```

### Run frontend in development
```bash
npm run dev --prefix client -- --host 0.0.0.0
```

### Run both together from project root
```bash
npm run dev
```

## 9. Deployment Instructions

### Server environment
Use [server/.env.example](<server/.env.example>) as a local template. For production, configure environment variables in the backend host's secret/settings panel instead of committing a `.env` file:
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=<at-least-32-random-bytes>
MONGODB_URI=<managed-mongodb-connection-string>
CLIENT_URL=https://your-frontend.example.com
OPENAI_API_KEY=<optional-provider-key>
```

- Set `NODE_ENV=production`; production startup rejects a missing `JWT_SECRET` or one shorter than 32 bytes. Generate a unique secret and keep it in the host's secret store.
- Set `PORT` to the numeric port supplied by the host. The server validates the port and listens on it.
- Configure `MONGODB_URI` with a production MongoDB connection string and restrict database/network access to the backend service. Learner-account and persistence features require the database; the API returns `503` for those routes when MongoDB is unavailable.
- Set `CLIENT_URL` to the frontend's exact origin (scheme and host, without a path). CORS currently accepts this single configured origin in production.
- `AI_PROVIDER` selects `ollama` (the default when no OpenAI key is set) or `openai`.
- `OLLAMA_BASE_URL` defaults to `http://127.0.0.1:11434`; `OLLAMA_MODEL` defaults to `qwen2.5:3b`. Install Ollama and pull that model with `ollama pull qwen2.5:3b` for local answers without an API key.
- `OPENAI_API_KEY` is only required when `AI_PROVIDER=openai`.
- `ADMIN_SIGNUP_CODE` is required only for initial admin signup. Keep it private in the server environment; it is never sent to the browser or committed. Existing admins create further admin accounts from the protected dashboard.

To set up the local model on Windows, install Ollama with `winget install --id Ollama.Ollama --exact --source winget`, then open a new terminal and run `ollama pull qwen2.5:3b`. Keep Ollama running while using the mentor. Restart the backend after changing AI provider settings.

### Frontend build environment
Set `VITE_API_URL` in the frontend host's build environment to the deployed API base URL, including `/api`, for example `https://api.example.com/api`. Vite embeds this value at build time, so configure it before building/rebuilding the frontend. Do not put server secrets such as `JWT_SECRET`, `MONGODB_URI`, or `OPENAI_API_KEY` in frontend variables.

### Production deployment basics
1. Provision a managed MongoDB database and allow network access only from the backend host.
2. Deploy the `server/` directory as a Node service. Install with `npm ci` from `server/`, start with `npm start`, and configure the server environment above. The host-provided `PORT` is used.
3. Verify the deployed API liveness endpoint responds at `https://<api-host>/api/health`, then confirm database readiness at `https://<api-host>/api/ready`. Health reports when the API is running in degraded mode; readiness returns HTTP 503 until MongoDB is connected.
4. Deploy the `client/` directory as a static site. Build with `npm ci` followed by `npm run build`; publish the `client/dist/` output. Set `VITE_API_URL` to the deployed API URL before building.
5. Set the backend `CLIENT_URL` to the final frontend origin and redeploy/restart the API.
6. Use HTTPS for both services, configure secrets only in host secret stores, and never commit populated `.env` files. The repository root `.gitignore` excludes server environment files while allowing the example template.

The frontend uses browser-history routes; configure the static host to serve `index.html` for application routes such as `/dashboard` and `/analytics`.

## 10. Usage Notes

The app runs without an OpenAI API key when Ollama is installed and running locally with the configured model. By default, the backend uses Ollama for mentor answers, planning summaries, and note summaries. Install it with `ollama pull qwen2.5:3b`; set `AI_PROVIDER`, `OLLAMA_BASE_URL`, or `OLLAMA_MODEL` to customize the provider. If Ollama is unavailable, the mentor answers only supported local questions and clearly says when it cannot answer reliably. Set `AI_PROVIDER=openai` and configure `OPENAI_API_KEY` to use OpenAI instead. Learner-provided mission and note text is sent to whichever AI provider you configure; with Ollama, requests remain on the local machine.

MongoDB-backed persistence is implemented for learner goals, active plans and proposed tasks, analyzed notes, and explicitly learner-reported practice scores. Knowledge graph content and learner dashboard fixtures remain representative demo data; admin metrics are calculated from saved database records. Submitted practice scores are not independently verified assessment results. The agent proposes actions for the learner to review and does not autonomously execute external actions.

This is an agent-first learning assistant prototype, not a course catalog or LMS. Real learner analytics, verified assessments, broader model/provider configuration, and autonomous external integrations require additional implementation.

## 11. Current status

The project is a runnable prototype with:
- React landing page, authenticated agent workbench, and protected routes
- JWT-based registration, login, and session validation
- Goal intake, graph-informed proposed plans, notes analysis, mentor interaction, and learner-reported adaptive feedback
- MongoDB persistence for goals, plans/tasks, notes, and learner feedback
- Knowledge graph and learner dashboard fixtures; live admin metrics and admin account management
- Backend API validation, rate limiting, CORS, and security headers
- Automated backend tests plus frontend build and lint commands

The server can start without MongoDB, but registration, login, and learner-data persistence require a working database connection. AI provider access is optional; without a configured provider, the app uses local demo behavior. Knowledge graph content remains representative fixtures, and no notification service is currently connected.

Feature limitations and the distinction between persisted learner data and representative demo data are documented in the relevant sections above.
