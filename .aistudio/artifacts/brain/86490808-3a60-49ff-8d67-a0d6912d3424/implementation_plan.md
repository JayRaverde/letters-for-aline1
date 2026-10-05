# Fix Google AI Studio Cloud Run Shared Sanctuary for Aline

Enable the shared Google AI Studio Cloud Run link to serve the live sanctuary seamlessly without 404 or auth errors, preserving the anniversary countdown lock screen with passcode `september29`.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following choices were confirmed in Phase 1:
> - **Hosting & Link Target**: Fix Google AI Studio Cloud Run share settings so the provided Shared App URL (`ais-pre-...`) boots and serves the sanctuary reliably for Aline tonight.
> - **Opening Experience**: Keep the countdown lock screen active, permitting immediate early unlock with secret passcode `september29`.

---

## 1. Overview & Core Concept

- **What It Does**: Resolves the root cause of the Cloud Run 404 / blank screen so Aline can open `https://ais-pre-ptqimontoaebmgus6tavk7-680766178177.europe-west1.run.app` directly on her mobile device tonight, see the romantic countdown and wax seal lock, and enter the sanctuary using the passcode `september29`.
- **Target Audience / Persona**: Aline (receiving the private long-distance anniversary gift from Jazz).
- **Key Value**: Delivers an immediate, functioning link that works across mobile browsers without Google authentication roadblocks or container crashes.

---

## 2. User Experience & Visual Design

- **Arrival & Lock Screen**:
  - Warm midnight celestial canvas (`#070205`) with twinkling star particles and floating constellation beacons.
  - Ornate crimson wax seal medallion inscribed with "A & J | OCT 5 10 PM".
  - Live countdown timer running down to 10:00 PM tonight.
  - Secret passcode entry box accepting `september29` with joyful rose-gold confetti shower on unlock.
  - Direct "Enter Sanctuary Directly" shortcut button for effortless access if she doesn't want to type.
- **Inside the Sanctuary**:
  - **September 29 Countdown**: Dual horizon clocks (Her Horizon & His Horizon) with a live synchronized pulse heartbeat bridge.
  - **Letters to Aline Desk**: Warm ruled parchment & velvet noir stationery with real-time letters from Jazz.
  - **"Open When..." Wax Letters**: Envelopes sealed with rose, gold, sapphire, and emerald wax.
  - **Notebook Poetry**: Lined notebook paper verses with hidden romantic whispers on hover/tap.
  - **When We Meet**: Bucket list categorized into firsts, cozy evenings, food, and adventures.
  - **Real-Time Heartbeat Touch**: Tactile pulsing crimson heart sending warm screen flashes and counter updates.
- **Mobile Ergonomics**:
  - Compliant with mobile touch targets ($\ge 44\text{px}$ hitboxes).
  - Top navigation bar strictly capped under 15% viewport height with horizontal scrolling tab pills.
  - Zero-pill metadata formatting with clean typographic separators.

---

## 3. Key Technical Decisions & Diagnostics

- **Root Cause of 404 on Cloud Run Shared URL (`ais-pre-`)**:
  - *Port Binding Issue*: `server.ts` was hardcoded to `const PORT = 3000;`. In Google Cloud Run containers, traffic is routed to `process.env.PORT` (typically `8080`). When a container does not bind to `process.env.PORT`, Cloud Run health checks fail, resulting in an immediate HTTP 404 / 503.
  - *Fix*: Bind dynamically to `const PORT = Number(process.env.PORT) || 3000;` on host `0.0.0.0`.
- **Production Container Boot Pipeline**:
  - *Production Serving Mode*: `server.ts` must detect when `dist/index.html` exists and serve static assets via `express.static(distPath)` with an SPA fallback `app.get('*')`. It must avoid booting the heavy Vite dev middleware in Cloud Run production.
  - *Start Script Alignment*: In `package.json`, set `"start": "node server.ts"` (or `"start": "tsx server.ts"`) to align with Cloud Run runtime specifications.
- **Client Resilience**:
  - In `LiveLettersDesk.tsx`, API requests are already guarded with `application/json` checks and fallback to persistent `localStorage`, ensuring zero blank screens even under transient network interruptions.
  - React `ErrorBoundary` wraps the entire root in `main.tsx` to trap any DOM or WebKit exceptions.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                   Aline's Mobile Browser                    │
│   (Opens ais-pre Cloud Run URL on iOS / Android Chrome)     │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP GET /
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               Cloud Run Container (0.0.0.0:PORT)            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Express Server (server.ts)                            │  │
│  │ - Dynamic PORT: Number(process.env.PORT) || 3000      │  │
│  │ - Static Asset Server (dist/index.html & assets/)     │  │
│  │ - Live Letters API (/api/letters)                     │  │
│  └───────────────────────────┬───────────────────────────┘  │
└──────────────────────────────┼──────────────────────────────┘
                               │ Serves Bundled Client
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  React 19 Sanctuary Tree                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ <ErrorBoundary>                                       │  │
│  │   └─ <App>                                            │  │
│  │       ├─ <StarryCanvas> (Twinkling constellation)     │  │
│  │       ├─ <AnniversaryTimeLockScreen> (Code: sep29)    │  │
│  │       └─ Sanctuary Views:                             │  │
│  │           ├─ <CelestialCountdown>                     │  │
│  │           ├─ <LiveLettersDesk> (Auto-persisted)       │  │
│  │           ├─ <SealedWaxLetters>                       │  │
│  │           ├─ <InteractivePoetryParchment>             │  │
│  │           ├─ <MeetingBucketList>                      │  │
│  │           └─ <TactileHeartbeat>                       │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

- **Execution Steps**:
  1. Update `server.ts` to bind to `process.env.PORT || 3000` and cleanly serve production `dist` files whenever built.
  2. Verify `package.json` scripts (`start`, `dev`, `build`).
  3. Re-execute `npm run build` and `compile_applet`.
  4. Test local port responsiveness and health endpoints.
