# LinguaChat Backend Service

Production-ready Node.js, Express, Socket.IO, MongoDB Atlas, and Redis backend for **LinguaChat**, an AI-powered real-time multilingual communication platform.

---

## Technical Architecture & Stack

* **Runtime**: Node.js (ES Modules)
* **Framework**: Express.js
* **Database**: MongoDB Atlas (via Mongoose)
* **Caching & PubSub**: Redis (with memory cache fallback)
* **Real-time Engine**: Socket.IO
* **Authentication**: JSON Web Tokens (JWT) & bcrypt password hashing
* **AI & Translation**: Google Cloud Translation API, Gemini API, Google Speech-to-Text & Text-to-Speech
* **Sentiment & Perception**: HuggingFace / VADER heuristic engine
* **Code-Switch Detection**: SwitchPrint token-level analyzer
* **Calendar Sync**: Google Calendar API & iCalendar (.ics) builder
* **WebRTC Video Infrastructure**: Mediasoup SFU & Coturn TURN/STUN

---

## Directory Structure

```
backend/
├── config/             # DB, Redis, GCP, and Mediasoup configs
├── controllers/        # Express REST route controllers
├── middleware/         # Auth, Error handling, and Rate Limiting
├── models/             # Mongoose database schemas
├── routes/             # Express API routes
├── services/           # Business logic & external service abstractions
├── sockets/            # Socket.IO real-time event handlers
├── utils/              # Logger, response formatter, and ICS builder
├── integrations/       # GCP, HuggingFace, SwitchPrint API adapters
├── uploads/            # Voice notes and attachment storage
├── tests/              # Unit & integration test suites
├── server.js           # Server entry point
├── app.js              # Express app middleware configuration
├── package.json        # Dependencies & scripts
└── .env.example        # Environment variables template
```

---

## Local Setup & Quick Start

1. **Install Dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration**:
   Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The backend will start at `http://localhost:5000`. Health check endpoint: `http://localhost:5000/health`.

4. **Run Unit Tests**:
   ```bash
   npm test
   ```

---

## API Endpoints Overview

| Category | Endpoint | Method | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `/api/auth/register` | `POST` | User registration |
| | `/api/auth/login` | `POST` | User login & JWT issuance |
| | `/api/auth/profile` | `GET` / `PUT` | User profile management |
| **Chat** | `/api/chat/message` | `POST` | Send 1-to-1 or group message |
| | `/api/chat/messages/:userId` | `GET` | Retrieve 1-to-1 chat history |
| | `/api/chat/group/:groupId` | `GET` | Retrieve group chat history |
| | `/api/chat/groups` | `GET` / `POST` | Fetch/Create group chats |
| **Translation** | `/api/translate` | `POST` | AI text translation |
| | `/api/translate/detect` | `POST` | Language detection |
| | `/api/translate/echo` | `POST` | Echo Mode back-translation fidelity check |
| | `/api/perception/analyze` | `POST` | Perception Preview sentiment analysis |
| **Audit Trail**| `/api/audit/correction` | `POST` | Propose translation correction |
| | `/api/audit/approve/:id` | `PUT` | Dual-approval for glossary entry |
| **Debt Ledger**| `/api/debt/calculate` | `POST` | Calculate 5-factor debt score |
| | `/api/debt/dashboard` | `GET` | Debt ledger overview & metrics |
| | `/api/debt/remediate/:id`| `PUT` | Remediate translation debt item |
| **Calendar** | `/api/calendar/events` | `GET` / `POST` | Manage calendar events |
| | `/api/calendar/ics/:eventId`| `GET` | Download generated .ics file |

---

## Socket.IO Events

* **Chat**: `send-message`, `receive-message`, `typing`, `stop-typing`, `message-read`, `message-deleted`
* **Translation**: `translation-request`, `translation-response`, `echo-mode-check`, `echo-mode-result`
* **Video**: `call-user`, `incoming-call`, `call-answered`, `call-rejected`, `call-ended`, `ice-candidate`, `screen-share`
* **Audit**: `correction-proposed`, `correction-approved`, `correction-rejected`
* **Debt**: `debt-update`, `debt-alert`, `remediation-required`

---

## Render Deployment Instructions

1. Connect your repository to Render as a **Web Service**.
2. Build Command: `npm install`
3. Start Command: `node server.js`
4. Set Environment Variables in Render dashboard matching `.env.example`.
5. Health Check Path: `/health`
