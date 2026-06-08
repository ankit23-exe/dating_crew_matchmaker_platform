# TDC Matchmaker Platform

An internal matchmaker portal for **The Dating Crew (TDC)** — a premium Indian matchmaking service. Matchmakers log in, manage their client roster, review full biodata, run compatibility matching against a candidate pool, and send introductions.

This repo is a **monorepo** with a Next.js frontend and an Express API backend.


## ScreenShot
<img width="1600" height="912" alt="image" src="https://github.com/user-attachments/assets/0bc14285-4cf5-47af-8b8c-69421256fbf8" />
<img width="1600" height="950" alt="image" src="https://github.com/user-attachments/assets/5741114c-5624-4e4a-9622-4cd8c40256dd" />

---

## What It Does

| Area | Description |
|------|-------------|
| **Auth** | JWT cookie login for matchmakers (`/login`) |
| **Dashboard** | Overview, client list, follow-ups, pending responses |
| **Client profiles** | Full biodata view with notes, journey stage, and match history |
| **Find Matches** | Scores the entire pool locally, returns top 5, enriches top 3 with AI |
| **Send Match** | Records a sent introduction and triggers a (stub) email |

Data is stored in JSON files (`clients.json`, `pool.json`) for this MVP — no database required to run locally.

---

## Tech Stack

| Layer | Stack |
|-------|-------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| **Backend** | Express 5, TypeScript, JWT + bcrypt |
| **Matching** | Pure TypeScript scoring — zero API calls |
| **AI** | Optional enrichment for top-ranked pairs only (Gemini-compatible API) |

---

## Folder Structure

```
datingCrew/
├── README.md                 # This file
├── .gitignore
│
├── frontend/                 # Matchmaker portal (port 3000)
│   ├── src/
│   │   ├── app/              # Next.js App Router pages
│   │   │   ├── dashboard/    # Overview, clients, follow-ups, pending
│   │   │   ├── client/[id]/  # Client detail + Find Matches
│   │   │   └── login/
│   │   ├── components/       # UI: cards, sidebar, biodata panels, match results
│   │   ├── hooks/            # useClients, useClientDetail, useMatches
│   │   ├── lib/              # API client, auth, filters, formatting
│   │   └── types/            # Shared TypeScript types
│   ├── middleware.ts         # Route protection via auth cookie
│   └── public/
│
└── backend/                  # REST API (port 5001)
    ├── src/
    │   ├── controllers/      # auth, clients, match
    │   ├── services/
    │   │   ├── matching.service.ts   # Core scoring algorithm
    │   │   ├── ai.service.ts         # AI insight enrichment
    │   │   └── email.service.ts      # Match intro email (stub)
    │   ├── routes/           # /api/auth, /clients, /matches, /notes
    │   ├── middleware/       # JWT auth, error handling
    │   ├── data/
    │   │   ├── clients.json  # Matchmaker's active clients
    │   │   ├── pool.json     # Candidate pool (~120 profiles)
    │   │   └── matchmaker.json
    │   └── types/
    └── .env.example
```

---

## Matching Service — How It Works in Layers

Matching is a **pipeline of layers**. Each layer narrows or ranks candidates before anything expensive (like an AI call) happens.

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 0 — Controller (match.controller.ts)                     │
│  Score entire pool locally → show top 5 → AI only for top 3     │
└─────────────────────────────────────────────────────────────────┘
                              ▲
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 4 — Rank & slice (matching.service.ts)                   │
│  Sort by final score descending → return top N (default 5)      │
└─────────────────────────────────────────────────────────────────┘
                              ▲
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 3 — Weighted positive scoring (0–100)                    │
│  Different weights for male vs female clients                   │
└─────────────────────────────────────────────────────────────────┘
                              ▲
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 2 — Gender-specific rules                                │
│  Male client  → hard filters (reject)                           │
│  Female client → soft penalties (score reduction, no reject)    │
└─────────────────────────────────────────────────────────────────┘
                              ▲
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 1 — Gender filter                                        │
│  Only opposite-gender candidates from pool.json                 │
└─────────────────────────────────────────────────────────────────┘
```

### Layer 1 — Gender filter

Every client is matched only against candidates of the **opposite gender** from `pool.json`.

### Layer 2 — Gender-specific rules

The algorithm treats male and female clients differently, based on common Indian matchmaking preferences and research cited in the codebase (IIT Delhi income/education studies, Michigan age-gap preferences).

#### Male clients → **Hard filters** (candidate is removed entirely if any fail)

| Rule | Logic |
|------|-------|
| Age | Candidate must be younger than the client, or at most **2 years older** |
| Height | Candidate must be **shorter than or equal to** the client |
| Income | Candidate income must be **≤ client income** |
| Kids | `wantKids` must be compatible (yes/no cannot conflict) |
| Partner preference | Client must fall within candidate's stated `partnerAgeMin` / `partnerAgeMax` |

If a candidate fails any hard filter, they never appear in results.

#### Female clients → **Soft penalties** (no one is removed; score is reduced)

| Signal | Penalty |
|--------|---------|
| Man's education below woman's | −20 pts |
| Man's income below woman's | −15 pts |
| Man younger than woman | −10 pts |
| Man more than 10 years older | −8 pts |
| Man's height below 165 cm | −5 pts |

Female clients see a wider pool; mismatches surface as lower scores rather than hidden profiles.

### Layer 3 — Weighted positive scoring

Candidates who pass (or survive penalties) receive a **0–100 compatibility score** from aligned lifestyle and values signals.

**Male client weights (≈100 pts positive)**

| Signal | Points |
|--------|--------|
| Religion match | 15 |
| Relocation compatible | 20 |
| Diet compatible | 15 |
| Family type match | 15 |
| Caste match | 10 |
| Language overlap (≥1) | 10 |
| Open to pets match | 8 |
| Drinking + smoking | 7 |
| Personality overlap | bonus up to 5 |
| Exact `wantKids` match | bonus 5 |

**Female client weights (≈100 pts positive)**

| Signal | Points |
|--------|--------|
| Want kids alignment | 25 |
| Profession compatible | 20 |
| Relocation compatible | 18 |
| Diet compatible | 12 |
| Family type match | 10 |
| Religion match | 8 |
| Language overlap (≥1) | 7 |
| Pets / drinking / smoking / caste / personality | smaller bonuses |

**Final score** = positive points + soft penalties (clamped 0–100).

**Labels**

| Score | Label |
|-------|-------|
| ≥ 70 | High Potential |
| ≥ 45 | Good Match |
| < 45 | Possible |

### Layer 4 — Rank and slice

All scored candidates are sorted by final score. The top **5** are returned to the UI (`MATCH_DISPLAY_TOP_N=5`).

### Layer 0 — AI enrichment (controller only)

After local scoring finishes, the controller optionally calls AI **only for ranks 1–3** (`GEMINI_ENRICH_TOP_N=3`).

| Rank | Insight source |
|------|----------------|
| 1–3 | AI-generated reason + email draft (if API key is set) |
| 4–5 | Local insight from score breakdown — no API call |

**Why only top 3?** The local algorithm already surfaces the strongest candidates. Ranks 4–5 are still good matches, but spending API quota on them adds little value — the score and breakdown already explain the fit. This keeps latency low, avoids quota waste, and still gives human-quality copy for the matches a matchmaker is most likely to act on.

If the API quota is exceeded (429), a circuit breaker skips remaining AI calls and falls back to local insights for the rest.

---

## Design Choices

1. **Local scoring first, AI second**  
   The full pool (~120 candidates) is scored in pure TypeScript with **zero API calls**. Matching is fast, deterministic, and free. AI is a polish layer, not the source of truth.

2. **Gender-differentiated matching**  
   Male clients use strict hard filters (traditional gatekeeping). Female clients use soft penalties (broader pool, ranked results). This mirrors how premium Indian matchmaking often works in practice.

3. **Top-3 AI cap**  
   Show 5 matches, enrich 3 with AI. The top local scores are already strong — AI adds a warm one-liner and email draft where it matters most.

4. **JSON file storage (MVP)**  
   No database setup for demos. `clients.json` holds the matchmaker's roster; `pool.json` holds the candidate pool. Easy to seed and inspect.

5. **Cookie-based JWT auth**  
   HttpOnly cookie (`tdc_matchmaker_token`) with Next.js middleware protecting dashboard routes. Simple and secure enough for an internal tool.

6. **Luxury editorial UI**  
   The frontend uses a warm, admin-style dashboard — serif headings, rose-gold accents, DiceBear avatars, dense biodata panels — aimed at matchmakers who work through many profiles per day.

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env — set JWT_SECRET and optionally GEMINI_API_KEY
npm install
npm run dev
```

API runs at `http://localhost:5001`.

### Frontend

```bash
cd frontend
# Create .env with:
# NEXT_PUBLIC_API_URL=http://localhost:5001/api
npm install
npm run dev
```

Portal runs at `http://localhost:3000`.

### Environment variables (backend)

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | `5001` | API port |
| `JWT_SECRET` | — | Auth token signing |
| `FRONTEND_URL` | `http://localhost:3000` | CORS origin |
| `GEMINI_API_KEY` | — | AI enrichment (optional) |
| `GEMINI_MODEL` | `gemini-2.0-flash` | Model name |
| `MATCH_DISPLAY_TOP_N` | `5` | Match cards shown in UI |
| `GEMINI_ENRICH_TOP_N` | `3` | How many get AI insight |

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Matchmaker login |
| `GET` | `/api/clients` | List matchmaker's clients |
| `GET` | `/api/clients/:id` | Single client detail |
| `GET` | `/api/matches/:clientId` | Run matching + return top results |
| `POST` | `/api/matches/send` | Record and email a sent match |
| `GET` | `/api/health` | Health check |

---

## License

Private — The Dating Crew internal use.
