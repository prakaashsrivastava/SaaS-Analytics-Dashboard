# PRD 01 — Multi-tenant SaaS Analytics Dashboard

**Project:** 1 of 6  
**Deploy:** VPS (Ubuntu + Docker Compose) — No AWS  
**Database:** PostgreSQL 16
**Frontend:** Next.js 14  
**Estimated Build Time:** 5–7 days

---

## 1. Business Overview

**Problem it solves:**  
B2B SaaS companies need a white-label analytics dashboard where each customer (tenant) sees only their own data, with role-based access for their team members, and subscription-gated features.

**README headline metric:**  
> "Multi-tenant architecture supporting isolated data per organization, RBAC with 3 roles, subscription tier gating — production-ready on PostgreSQL + Next.js 14."

---

## 2. VPS Cost (No Free Tier)

| Item | Cost |
|------|------|
| VPS server (already owned) | ₹0 additional |
| SSL Certificate (Let's Encrypt) | ₹0 |
| Resend email (3,000/month free) | ₹0 |
| Resend email (over 3K/month) | $20/month (~₹1,670) |
| **Total for demo usage** | **₹0/month** |

---

## 3. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js | 14.2.x |
| Language | TypeScript | 5.4 |
| Styling | Tailwind CSS | 3.4 |
| Charts | Recharts | 2.12 |
| ORM | Prisma | 5.14 |
| Database | PostgreSQL | 16 |
| Auth | NextAuth.js | 4.24 |
| UI Components | shadcn/ui | latest |
| Form Validation | Zod + React Hook Form | 3.23 |
| Email | Resend | latest |
| Container | Docker + Compose | latest |
| Reverse Proxy | Nginx | alpine |

### npm packages

```bash
#### Core
next@14.2.x  react@18  react-dom@18
typescript  @types/node  @types/react

#### DB & Auth
prisma  @prisma/client
next-auth  @auth/prisma-adapter
bcryptjs  @types/bcryptjs

#### UI & Charts
tailwindcss  @tailwindcss/forms
recharts  lucide-react
@radix-ui/react-dialog  @radix-ui/react-dropdown-menu
class-variance-authority  clsx  tailwind-merge

#### Validation
zod  react-hook-form  @hookform/resolvers

#### Utils
date-fns  nanoid  resend
```

---

## 4. Features — MVP Scope (Detailed)

> **Note:** Build `lib/tenant.ts` and `lib/permissions.ts` first before any feature — every other feature depends on these two helpers.

---

### Feature 1 — Tenant Registration

**What it does:**  
A single sign-up form creates an `organisations` record and a `users` record in one atomic DB transaction. The user is automatically assigned the `owner` role for that organisation.

**Step-by-step flow:**

1. User fills `/register` form: Organisation Name, Full Name, Email, Password
2. Frontend Zod validation runs first: email format, password min 8 chars, org name min 2 chars — no API call until all pass
3. On submit → `POST /api/auth/register`
4. API opens a **Prisma transaction** (`prisma.$transaction([])`):
   - Step 1: Check if email already exists in `users` → throw `409 Conflict` if yes
   - Step 2: Generate a URL-safe slug from org name using `nanoid` suffix (e.g., "Acme Corp" → `acme-corp-x4k2`)
   - Step 3: `INSERT INTO organisations` — name, slug, `plan = 'free'`, `timezone = 'Asia/Kolkata'`
   - Step 4: `INSERT INTO users` — email, `bcryptjs.hash(password, 10)`, name
   - Step 5: `INSERT INTO org_members` — org_id, user_id, `role = 'owner'`
   - If any step fails → entire transaction rolls back, nothing is created
5. On transaction success → dispatch `SendWelcomeEmailJob` (fire-and-forget, does not block response)
6. Immediately call NextAuth `signIn('credentials', { email, password })` — user lands on dashboard without a second login step

**How it connects to other features:**
- The `organisations.slug` created here is used in every dashboard URL: `/dashboard/[slug]` — all routing depends on this
- The `org_members` row with `role = 'owner'` is exactly what RBAC (Feature 3) reads when deciding what buttons to show and what API actions to allow
- `plan = 'free'` set here is what Subscription Tier (Feature 5) reads to enforce the 1-project limit and 7-day analytics window
- All `projects` created in Feature 6 are linked to this `org_id` — the tenant context flows everywhere through `org_id`

**Edge cases:**
- Slug collision: if `acme-corp` exists, loop `nanoid(4)` suffix until unique — max 5 attempts, then throw
- Org name with special characters (e.g., "Prákaash & Co"): strip non-alphanumeric before slug generation → `prakaash-co-x4k2`
- User submits twice (double-click): idempotency handled by the email uniqueness check

---

### Feature 2 — Multi-tenant Auth & Session Scoping

**What it does:**  
Every authenticated session carries `orgId`, `orgSlug`, and `role` in the JWT. Every API route reads these from the session and scopes every DB query to that `org_id`. No tenant can ever read another tenant's data — this is enforced at the query level, not just the route level.

**Step-by-step flow:**

1. User navigates to `/login` → enters email + password
2. NextAuth `authorize()` callback fires:
   - `SELECT * FROM users WHERE email = ?` → verify with `bcryptjs.compare()`
   - `SELECT * FROM org_members WHERE user_id = ?` → get `org_id` and `role`
   - `SELECT slug FROM organisations WHERE id = org_id` → get `org_slug`
   - Return combined object: `{ id, email, name, orgId, orgSlug, role }`
3. NextAuth `jwt()` callback: encode `orgId`, `orgSlug`, `role` into the encrypted JWT cookie
4. NextAuth `session()` callback: expose `session.user.orgId`, `session.user.role`, `session.user.orgSlug` to client components via `useSession()`
5. Every API route (example `GET /api/projects`):
   ```typescript
   const { orgId, role } = await getTenantContext(req) // reads session
   const projects = await prisma.projects.findMany({
     where: { org_id: orgId }   // ← always scoped, no exceptions
   })
   ```
6. Next.js middleware (`middleware.ts`) protects all `/dashboard/*` routes — unauthenticated requests redirect to `/login?callbackUrl=`

**`lib/tenant.ts` — build this first:**
```typescript
export async function getTenantContext(req?: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error('UNAUTHORIZED')
  return {
    orgId:   session.user.orgId,
    orgSlug: session.user.orgSlug,
    role:    session.user.role,
    userId:  session.user.id,
  }
}
```

**How it connects to other features:**
- `orgId` flows into every analytics query (Feature 7) — without this, one tenant could see another's data
- `role` flows into `canDo()` in Feature 3 — auth and RBAC are always used together
- `orgSlug` is used for URL routing — the dashboard layout reads it from `params.slug` and cross-checks it with `session.user.orgSlug` to prevent URL manipulation
- Invited members (Feature 4) go through this exact same flow on their first login — their role comes from the `org_members` row created during invitation acceptance

**Edge cases:**
- URL slug mismatch (user manually edits URL to another tenant's slug): middleware cross-checks `params.slug === session.user.orgSlug` → redirect to their correct URL
- Session expires mid-session: Next.js `useSession()` automatically redirects on 401 with `callbackUrl` to return them to the same page after re-login
- User belongs to multiple orgs (future): session holds "active org", `TenantSwitcher` component in sidebar lets user switch — updates session via `POST /api/auth/switch-org`

---

### Feature 3 — RBAC (Role-Based Access Control)

**What it does:**  
Three roles — `OWNER`, `ADMIN`, `MEMBER` — each with a different permission set. Enforced in two places: API layer (before every DB write) and UI layer (hide/disable buttons the user cannot use).

**Permission matrix:**

| Action | OWNER | ADMIN | MEMBER |
|--------|-------|-------|--------|
| Invite members | ✅ | ✅ | ❌ |
| Remove members | ✅ | ❌ | ❌ |
| Create projects | ✅ | ✅ | ❌ |
| Delete projects | ✅ | ❌ | ❌ |
| View analytics | ✅ | ✅ | ✅ |
| Change org settings | ✅ | ❌ | ❌ |
| Upgrade plan | ✅ | ❌ | ❌ |

**`lib/permissions.ts` — build this alongside `lib/tenant.ts`:**
```typescript
const PERMISSIONS: Record<string, string[]> = {
  owner:  ['invite_member','remove_member','create_project','delete_project','view_analytics','change_settings','upgrade_plan'],
  admin:  ['invite_member','create_project','view_analytics'],
  member: ['view_analytics'],
}
export function canDo(role: string, action: string): boolean {
  return PERMISSIONS[role]?.includes(action) ?? false
}
```

**API enforcement (every write route follows this pattern):**
```typescript
// POST /api/projects
const { orgId, role } = await getTenantContext()
if (!canDo(role, 'create_project')) {
  return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
}
// ... proceed with DB insert
```

**UI enforcement:**
- Every action button checks role before rendering:
  ```tsx
  const { data: session } = useSession()
  const role = session?.user?.role
  {canDo(role, 'invite_member') && <InviteButton />}
  ```
- "Settings" link in sidebar only rendered for `role === 'owner'`
- "Upgrade" button only rendered for `role === 'owner'`

**How it connects to other features:**
- Reads `role` from session set in Feature 2 — auth and permissions are always paired
- Controls the Invite Member form in Feature 4 — non-MEMBER roles only
- Controls the Upgrade button in Feature 5 — OWNER only
- Controls project creation in Feature 6 — OWNER and ADMIN only
- Controls Settings page access in Feature 8 — OWNER only

**Edge cases:**
- Owner tries to remove themselves: API checks `WHERE role = 'owner' AND org_id = ?` count > 1 before allowing — block with "Cannot remove the only owner"
- Admin tries to change another admin's role: not exposed in UI and blocked at API with 403

---

### Feature 4 — Member Invitations

**What it does:**  
Owner or Admin enters an email + role. The invitee receives a time-limited email link. Clicking the link opens a sign-up page pre-filled with their email. After setting a password they are immediately added to the organisation with the invited role.

**Step-by-step flow:**

1. Owner/Admin opens Members page → clicks "Invite Member"
2. Modal appears: Email input + Role dropdown (Admin / Member) — "Invite" button
3. Frontend checks `canDo(role, 'invite_member')` before even rendering this button
4. Submit → `POST /api/invitations` with `{ email, role }`
5. API:
   - Calls `getTenantContext()` → checks `canDo(role, 'invite_member')` → 403 if not
   - Checks `org_members` → if email already a member → return `{ error: 'ALREADY_MEMBER' }`
   - Checks `invitations` → if active (not accepted, not expired) invite exists for this email+org → return `{ error: 'INVITE_PENDING' }`
   - Generates token: `nanoid(32)` — cryptographically random, URL-safe
   - Inserts: `{ org_id, email, role, token, expires_at: now() + 48h, accepted: false }`
   - Sends email via Resend: subject "You've been invited to [Org Name]", body contains link `/invite/[token]`
6. Invitee clicks link → navigates to `/invite/[token]`
7. Page mounts → `GET /api/invitations/[token]`:
   - Validates: token exists, `expires_at > now()`, `accepted = false`
   - Returns `{ orgName, email, role }` — used to pre-fill form and show "You're joining [Org Name] as [role]"
8. Invitee fills Name + Password → submits:
   - If email already has a user account: skip user creation, only create `org_members` row
   - If new user: creates `users` row + `org_members` row in one transaction
   - Sets `invitations.accepted = true`
9. User auto-signed-in via NextAuth → redirected to `/dashboard/[orgSlug]`

**How it connects to other features:**
- The `org_members` row created here is immediately read by RBAC (Feature 3) — new member gets correct permissions on first login
- New member's session (Feature 2) will carry their assigned `role` → they see the dashboard with MEMBER-level access (view analytics, no project creation)
- If the org is on FREE plan (Feature 5) with 3 member limit, API checks member count before inserting
- Members page (UI) refreshes member list by re-fetching `GET /api/org/members` — the new row appears instantly

**Edge cases:**
- Token expired (>48 hours): page shows "This invite has expired — ask your admin to resend" with a mailto link
- Token already used: page shows "This invite link has already been used — try logging in"
- Invitee's email already registered under a different org: skip `users` INSERT, only INSERT `org_members` — user can now belong to multiple orgs

---

### Feature 5 — Subscription Tiers

**What it does:**  
Two plans — `FREE` and `PRO` — gate specific features. The upgrade is mocked (no real payment) — clicking "Upgrade" sets `organisations.plan = 'pro'` in the DB. This demonstrates the architecture pattern clients actually pay senior rates for: clean feature-gating that doesn't scatter `if plan === 'pro'` conditions everywhere.

**Tier comparison:**

| Feature | FREE | PRO |
|---------|------|-----|
| Projects | 1 max | Unlimited |
| Analytics data window | 7 days | 90 days |
| Team members | 3 max | Unlimited |
| Charts shown | 2 (timeseries + breakdown) | 4 (+ funnel + retention) |
| Data export | ❌ | ✅ (stretch) |

**How gating is implemented (centralised, not scattered):**

Create `lib/plan.ts`:
```typescript
export function getPlanLimits(plan: string) {
  return {
    maxProjects:  plan === 'pro' ? Infinity : 1,
    maxMembers:   plan === 'pro' ? Infinity : 3,
    dataWindowDays: plan === 'pro' ? 90 : 7,
  }
}
```

Every feature that needs gating calls `getPlanLimits(org.plan)` — the logic lives in one place.

**Step-by-step flow — project creation gate:**
1. `POST /api/projects` is called
2. API fetches `{ plan } = await prisma.organisations.findUnique({ where: { id: orgId } })`
3. `const limits = getPlanLimits(plan)`
4. Counts existing projects: `SELECT COUNT(*) FROM projects WHERE org_id = ?`
5. If `count >= limits.maxProjects` → return `{ error: 'UPGRADE_REQUIRED', feature: 'projects', limit: 1 }`
6. Frontend receives `UPGRADE_REQUIRED` → automatically opens "Upgrade to Pro" modal

**Step-by-step flow — analytics data window:**
1. `GET /api/analytics/[projectId]/timeseries` called
2. API fetches org plan → `const { dataWindowDays } = getPlanLimits(plan)`
3. SQL query: `WHERE occurred_at > now() - interval '${dataWindowDays} days'`
4. FREE users see a subtle "Upgrade for 90-day history" banner below the chart

**Step-by-step flow — mock upgrade:**
1. Owner clicks "Upgrade to Pro" → `POST /api/org/upgrade`
2. API: `canDo(role, 'upgrade_plan')` → 403 if not owner
3. `UPDATE organisations SET plan = 'pro' WHERE id = orgId`
4. Returns `{ plan: 'pro' }`
5. Frontend updates `session` (NextAuth `update()`) → UI immediately unlocks PRO features without page reload

**How it connects to other features:**
- Analytics queries (Feature 7) use `dataWindowDays` from plan limits — the same SQL runs differently based on plan
- Project creation (Feature 6) checks `maxProjects` limit before inserting
- Invitation flow (Feature 4) checks `maxMembers` limit before sending invite
- Settings page (Feature 8) shows current plan badge with "Upgrade" CTA visible to OWNER

---

### Feature 6 — Projects

**What it does:**  
Each organisation can have one or more Projects. A Project represents a tracked app or website. All analytics events are stored against a `project_id`. This separation means one dashboard can display analytics for multiple products independently.

**Step-by-step flow — create a project:**
1. User clicks "New Project" in the sidebar (button only visible to OWNER/ADMIN via RBAC)
2. Modal opens: Project Name (required), Domain (optional, e.g., `app.acme.com`), Description (optional)
3. Submit → `POST /api/projects`
4. API:
   - `canDo(role, 'create_project')` check
   - Plan limit check via `getPlanLimits(plan).maxProjects`
   - INSERT into `projects`: `{ org_id: orgId, name, domain }`
5. Returns new project object → frontend navigates to `/dashboard/[slug]/projects/[id]`
6. New project page shows empty charts with a "No data yet" empty state + "How to track events" instructions

**Step-by-step flow — view project:**
1. User clicks a project in sidebar → navigates to `/dashboard/[slug]/projects/[id]`
2. Page fires **3 parallel requests** using `Promise.all()`:
   - `GET /api/analytics/[projectId]/overview`
   - `GET /api/analytics/[projectId]/timeseries`
   - `GET /api/analytics/[projectId]/breakdown`
3. All 3 queries are scoped by both `project_id` AND `org_id` (double-scoped for safety):
   ```sql
   WHERE project_id = $1
   AND project_id IN (SELECT id FROM projects WHERE org_id = $2)
   ```
4. Charts render with Recharts once all 3 responses return

**How it connects to other features:**
- `project_id` is the FK for all `events` rows — analytics (Feature 7) is entirely project-scoped
- Plan gating (Feature 5) limits project count — the project list page shows an "Upgrade" card when limit is reached instead of a "New Project" button
- RBAC (Feature 3) hides the "New Project" button from MEMBERs, hides "Delete Project" from ADMINs
- Deleting a project cascades to delete all its `events` rows — warn user: "This will permanently delete [N] events"

**Edge cases:**
- Deleting a project with thousands of events: use a background job rather than a synchronous delete to avoid timeout — mark as `deleting = true`, show "Deleting..." badge, cron cleans up
- Project with no events: show empty state with tracking code snippet (even if it's just a placeholder `curl` example)

---

### Feature 7 — Analytics Dashboard

**What it does:**  
Three visualisations per project: metric summary cards (overview), a time-series line chart (events over time), and an event-type breakdown bar chart. A seed script provides 90 days of realistic data so the demo looks live from day one.

**Step-by-step flow — Metric Cards (`/overview` endpoint):**

1. `GET /api/analytics/[projectId]/overview` is called on page load
2. Single SQL query with conditional aggregation:
```sql
SELECT
  COUNT(*) FILTER (WHERE event_type = 'page_view')  AS total_pageviews,
  COUNT(*) FILTER (WHERE event_type = 'signup')      AS total_signups,
  SUM(revenue)                                        AS total_revenue,
  COUNT(DISTINCT properties->>'session_id')           AS unique_sessions
FROM events
WHERE project_id = $1
  AND occurred_at > now() - interval '$2 days'
```
3. The `$2 days` is injected from `getPlanLimits(plan).dataWindowDays` — 7 or 90
4. Returns 4 values → renders as `<MetricCard>` components (value + % change vs previous period)
5. % change: run same query for the previous equal-length period, compute delta

**Step-by-step flow — Line Chart (`/timeseries` endpoint):**

1. `GET /api/analytics/[projectId]/timeseries?days=30`
2. SQL groups events by day using `date_trunc`:
```sql
SELECT
  date_trunc('day', occurred_at AT TIME ZONE $timezone) AS day,
  COUNT(*)       AS event_count,
  SUM(revenue)   AS daily_revenue
FROM events
WHERE project_id = $1
  AND occurred_at > now() - interval '$2 days'
GROUP BY day
ORDER BY day ASC
```
3. `$timezone` is `organisations.timezone` — e.g., `'Asia/Kolkata'` — so daily grouping matches the org's local midnight, not UTC midnight
4. Returns array of `{ day: string, event_count: number, daily_revenue: number }`
5. Frontend renders `<LineChart>` with two Y-axes (events on left, revenue on right)

**Step-by-step flow — Bar Chart (`/breakdown` endpoint):**

1. `GET /api/analytics/[projectId]/breakdown`
2. SQL groups by event type:
```sql
SELECT
  event_type,
  COUNT(*) AS count
FROM events
WHERE project_id = $1
  AND occurred_at > now() - interval '$2 days'
GROUP BY event_type
ORDER BY count DESC
```
3. Returns array of `{ event_type: string, count: number }`
4. Frontend renders `<BarChart>` with each event type as a bar, color-coded by type

**Seed script structure (`prisma/seed.ts`):**

```typescript
// Creates 3 demo organisations
// Acme Corp — FREE plan, 1 project
// TechStart — PRO plan, 3 projects
// RetailCo  — PRO plan, 2 projects

// For each project, inserts 90 days of events:
for (let daysAgo = 89; daysAgo >= 0; daysAgo--) {
  const dayDate = subDays(new Date(), daysAgo)
  const isWeekend = [0, 6].includes(dayDate.getDay())
  const baseVolume = isWeekend ? 0.6 : 1  // weekends are quieter

  // Page views: 200–500/day with trend growth
  // Signups: 5–15/day
  // Purchases: 2–8/day with revenue 500–5000 INR
  // All inserted as bulk INSERT for performance
}
```

**How it connects to other features:**
- All queries use `org_id` from session (Feature 2) — tenant isolation enforced at query level
- Date window (`dataWindowDays`) comes from plan limits (Feature 5) — same charts, different data range
- Timezone comes from org settings (Feature 8) — analytics respects the org's local time for daily grouping
- Only accessible to users with `view_analytics` permission (Feature 3)

---

### Feature 8 — Settings Page

**What it does:**  
Org-level settings page accessible only to OWNER. Update organisation name, upload a logo, and change the timezone. Changes take effect across the entire dashboard immediately.

**Step-by-step flow:**
1. Owner navigates to `/dashboard/[slug]/settings`
2. Page calls `GET /api/org/settings` on load → returns current org name, logo URL, timezone, plan
3. Form pre-filled with current values
4. **Logo upload sub-flow:**
   - User clicks "Upload Logo" → file picker opens (accept: `image/*`, max 2MB)
   - Frontend validates file size/type before uploading
   - `POST /api/org/logo` with `multipart/form-data`
   - API saves file to `/public/uploads/[orgId]/logo.[ext]` on VPS, returns public URL
   - URL stored in `organisations.logo_url`
   - Logo preview updates immediately in the form
5. **Save settings sub-flow:**
   - User edits name and/or selects new timezone from dropdown (list of IANA timezones via `Intl.supportedValuesOf('timeZone')`)
   - `PUT /api/org/settings` with `{ name, logoUrl, timezone }`
   - API: `canDo(role, 'change_settings')` → 403 if not owner
   - `UPDATE organisations SET name = $1, logo_url = $2, timezone = $3 WHERE id = $4`
6. On success → sidebar immediately re-renders with new org name and logo (client state updated via SWR/React Query invalidation)

**How it connects to other features:**
- `timezone` saved here is used in analytics queries (Feature 7) — `date_trunc('day', occurred_at AT TIME ZONE timezone)` ensures daily grouping matches local midnight
- `logo_url` is displayed in the sidebar header (Feature 2 session data) and on the dashboard layout
- `name` change is reflected in invitation emails (Feature 4) — new invites show the updated org name
- Settings page only accessible because RBAC (Feature 3) checks `canDo(role, 'change_settings')` — non-owners see a 403 page

---

## 5. Database Schema

```sql
CREATE TABLE organisations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(60) UNIQUE NOT NULL,
  logo_url    TEXT,
  plan        VARCHAR(20) DEFAULT 'free',
  timezone    VARCHAR(50) DEFAULT 'Asia/Kolkata',
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT,
  name          VARCHAR(100),
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE org_members (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id   UUID REFERENCES organisations(id) ON DELETE CASCADE,
  user_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  role     VARCHAR(20) DEFAULT 'member',
  UNIQUE(org_id, user_id)
);

CREATE TABLE invitations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID REFERENCES organisations(id) ON DELETE CASCADE,
  email      VARCHAR(255) NOT NULL,
  role       VARCHAR(20) DEFAULT 'member',
  token      VARCHAR(100) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted   BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE projects (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID REFERENCES organisations(id) ON DELETE CASCADE,
  name       VARCHAR(100) NOT NULL,
  domain     VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE events (
  id           BIGSERIAL PRIMARY KEY,
  project_id   UUID REFERENCES projects(id) ON DELETE CASCADE,
  event_type   VARCHAR(50) NOT NULL,
  properties   JSONB DEFAULT '{}',
  revenue      NUMERIC(10,2) DEFAULT 0,
  occurred_at  TIMESTAMPTZ NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_events_project_time ON events(project_id, occurred_at DESC);
```

---

## 6. API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Create org + owner user (transaction) |
| POST | `/api/auth/[...nextauth]` | NextAuth credentials handler |
| POST | `/api/invitations` | Send invite email with signed token |
| GET | `/api/invitations/[token]` | Validate token, return org + role info |
| GET | `/api/org/members` | List members with roles |
| DELETE | `/api/org/members/[id]` | Remove member (owner only) |
| GET | `/api/projects` | List projects scoped to tenant |
| POST | `/api/projects` | Create project (plan + RBAC gated) |
| GET | `/api/analytics/[projectId]/overview` | Metric cards (4 aggregates) |
| GET | `/api/analytics/[projectId]/timeseries` | Daily event counts for line chart |
| GET | `/api/analytics/[projectId]/breakdown` | Events by type for bar chart |
| POST | `/api/org/upgrade` | Mock upgrade — sets plan=pro |
| PUT | `/api/org/settings` | Update name, logo, timezone |
| GET | `/api/org/settings` | Get current org settings |

---

## 7. Folder Structure

```
saas-dashboard/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── invite/[token]/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   └── [slug]/
│   │       ├── page.tsx
│   │       ├── projects/page.tsx
│   │       ├── projects/[id]/page.tsx
│   │       ├── members/page.tsx
│   │       └── settings/page.tsx
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── analytics/[projectId]/
│       │   ├── overview/route.ts
│       │   ├── timeseries/route.ts
│       │   └── breakdown/route.ts
│       ├── invitations/route.ts
│       └── org/
│           ├── members/route.ts
│           ├── settings/route.ts
│           ├── upgrade/route.ts
│           └── logo/route.ts
├── components/
│   ├── charts/
│   │   ├── TimeseriesChart.tsx
│   │   ├── EventBreakdownChart.tsx
│   │   └── MetricCard.tsx
│   ├── dashboard/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── TenantSwitcher.tsx
│   └── ui/
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── tenant.ts         ← getTenantContext() — build first
│   ├── permissions.ts    ← canDo() — build first
│   └── plan.ts           ← getPlanLimits() — build first
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── docker-compose.yml
├── Dockerfile
└── nginx/nginx.conf
```

---

## 8. Docker Compose

```yaml
version: '3.9'
services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: saas_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: saas_dashboard
    volumes:
      - pgdata:/var/lib/postgresql/data
  app:
    build: .
    restart: unless-stopped
    depends_on: [db]
    environment:
      DATABASE_URL: postgresql://saas_user:${DB_PASSWORD}@db:5432/saas_dashboard
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: https://yourdomain.com
      RESEND_API_KEY: ${RESEND_API_KEY}
    ports:
      - "3000:3000"
  nginx:
    image: nginx:alpine
    restart: unless-stopped
    depends_on: [app]
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - ./certs:/etc/nginx/certs:ro
volumes:
  pgdata:
```

---

## 9. Dockerfile

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 10. Environment Variables

```env
DATABASE_URL="postgresql://saas_user:password@db:5432/saas_dashboard"
NEXTAUTH_SECRET="openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
RESEND_API_KEY="re_xxxx"
EMAIL_FROM="noreply@yourdomain.com"
```

---

## 11. README Highlights for Upwork

- Multi-tenant PostgreSQL with row-level data isolation — no cross-tenant data leakage possible
- RBAC enforced at both API and UI layers — not just hidden buttons
- Centralised plan gating via `getPlanLimits()` — no scattered `if plan === 'pro'` conditions
- JWT session carries tenant context — all queries are org-scoped by design
- Timezone-aware analytics — `date_trunc` uses org timezone, not UTC
- Dockerised — runs in 1 command: `docker compose up -d`
- Seeded with 90-day realistic event data across 3 demo tenants
