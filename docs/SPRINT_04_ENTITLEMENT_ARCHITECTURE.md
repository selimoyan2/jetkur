# JetKur — Sprint 04: Package, Trial & Entitlement Architecture

## 1. Architectural Philosophy: Package != Menu, Package = Entitlement

In JetKur SaaS architecture, commercial plans are **never** hardcoded condition checks scattered across UI components (e.g. `if (plan === "AGENCY")`). Instead:
- **Plans** define a commercial tier with canonical machine identifiers (`ENTRY`, `BUSINESS`, `AGENCY`).
- **Subscriptions** bind a tenant **Workspace** to a Plan and maintain lifecycle/billing state (`TRIALING`, `ACTIVE`, `PAST_DUE`, `CANCELED`, `EXPIRED`).
- **Entitlements** grant fine-grained functional capabilities (`site.blog`, `site.customDomain`, `agency.whiteLabel`) and numeric limits (`sites.max`, `languages.max`, `teamMembers.max`).
- **Applications & UI** evaluate feature capabilities centrally via `can(featureKey)` and `getLimit(limitKey)`.

---

## 2. Conceptual Hierarchy

```
WORKSPACE (Tenant Authority)
  │
  ├── SUBSCRIPTION (1:1 Active Commercial State)
  │     ├── Status: TRIALING | ACTIVE | PAST_DUE | CANCELED | EXPIRED
  │     ├── trialStartsAt / trialEndsAt (Server-authoritative timestamps)
  │     └── PLAN (Canonical: ENTRY, BUSINESS, AGENCY)
  │           ├── siteLimit (ENTRY: 1, BUSINESS: 3, AGENCY: 10)
  │           ├── trialDays (Default: 14)
  │           └── PLAN_ENTITLEMENTS (Capabilities & Numeric Limits)
  │
  ├── SITES (Multi-Site Management)
  │     └── Status: DRAFT | TRIAL | ACTIVE | SUSPENDED | ARCHIVED
  │
  └── ENTITLEMENT_OVERRIDES (Future-proof Workspace Overrides)
```

---

## 3. Server Authority vs. UI Visibility

| Layer | Responsibility | Authority |
| :--- | :--- | :--- |
| **Browser (Client)** | Renders UI, hides unentitled tabs via `can("site.blog")`, displays upgrade CTAs | **Untrusted** (UX only) |
| **API Endpoints** | Authenticates session, validates workspace membership, enforces capability guards (`requireEntitlement`) | **Trust Boundary** |
| **Entitlement Service** | Dynamically resolves effective subscription, expiration timestamps, and limits | **Authoritative Logic** |
| **PostgreSQL Database** | Persists Plans, Subscriptions, Entitlements, and Sites | **Authoritative State** |

Client requests tampering with `planCode="AGENCY"`, `siteLimit=999`, or `trialEndsAt="2099"` in payloads are strictly ignored. The server resolves state exclusively from persisted tenant records.

---

## 4. 14-Day Server-Authoritative Trial System

- **Default Registration Plan**: Every newly registered user automatically starts a 14-day free trial on the **BUSINESS** plan (`CANONICAL_PLAN_CODES.BUSINESS`). This empowers customers to experience real value (custom domains, blog, multi-language, AI tools) immediately.
- **Server Clock Authority**: Trial start and end timestamps (`trialStartsAt`, `trialEndsAt`) are calculated on the server using `Date.now()`. Client device clocks and timezones are never trusted.
- **Cron-Independent Expiration Resilience**: When a subscription has status `TRIALING` and `trialEndsAt <= serverNow`, the service dynamically computes `effectiveStatus = "EXPIRED"`. The system does not depend on a background cron job to protect features from unauthorized use.

---

## 5. Site Limit & Archived Site Policy

- **Site Limits by Plan**:
  - `ENTRY`: 1 website
  - `BUSINESS`: 3 websites
  - `AGENCY`: 10 websites
- **Archived Site Policy**:
  - `DRAFT`, `TRIAL`, `ACTIVE`, `SUSPENDED` sites are **COUNTED** towards the workspace site limit.
  - `ARCHIVED` sites are **NOT COUNTED** towards the workspace site limit.
- **Enforcement**:
  - Before creating a new site, `canCreateSite(workspaceId)` verifies that `activeSites < siteLimit`.
  - If limit is reached, HTTP 403 `SITE_LIMIT_REACHED` is returned.

---

## 6. Expired Subscription Policy

- **Data Preservation**: User sites, business profiles, contents, and custom domains are **NEVER deleted** upon subscription or trial expiration.
- **Read-Only Dashboard Access**: Expired users can securely log in and view their dashboard and existing site content (`site.view: true`).
- **Mutation Restraints**: Mutations, deploys (`site.publish: false`), new site creation (`site.create: false`), and editing (`site.edit: false`) are blocked until renewed or upgraded.

---

## 7. Platform Super Admin Policy

- Super Admins (`platformRole === "SUPER_ADMIN"`) bypass tenant-level entitlement restrictions and site limits for global diagnostics, customer support, and system maintenance.
