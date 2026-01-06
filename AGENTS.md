# AGENTS.md

## Scope and intent

This repository is a starter template for a **mobile-first web application** built with **React** (Vite) and deployed to **Firebase Hosting** using **GitHub Actions**:

- **Pull Requests** deploy to **Firebase Hosting Preview Channels** (a unique preview URL per PR).
- **Pushes to `main`** deploy to the **`live`** channel (production).

This file is written for AI coding agents (e.g., GitHub Copilot coding agent) and is intended to be the single source of truth for how to work safely and consistently in this repo.

---

## Non-negotiables

1. **Do not commit secrets.**
   - Never add service account JSON files, tokens, or `.env` secrets to git.
   - Use GitHub Actions Secrets for credentials.
2. **Never deploy to an unknown Firebase project.**
   - Always use explicit `--project <projectId>` flags for Firebase commands.
3. **Keep builds deterministic.**
   - Use `npm ci` in CI.
   - Ensure `package-lock.json` exists and is committed.
4. **Keep changes small and reviewable.**
   - Prefer multiple small commits over one large commit.
5. **Do not break PR preview deployments.**
   - Preview deployments are required for this starter.

---

## Agent decision tree

Before making ANY changes, answer these questions in order:

**1. Does this involve CI/CD workflows, GitHub secrets, or firebase.json?**
   - If YES → STOP. Request human review. Never auto-modify workflows, secrets, or core configs.
   - If NO → Continue.

**2. Is this a breaking change or major version bump?**
   - If YES → STOP. Request human review before proceeding.
   - If NO → Continue.

**3. Does this add a service worker or offline logic?**
   - If YES → Must include unit tests and documentation. Plan for review.
   - If NO → Continue.

**4. Will this require new dependencies?**
   - If YES → Use `npm ci` only. Never run `npm install` in CI. Verify package-lock.json is committed.
   - If NO → Continue.

**5. Will this change bundle size by > 10%?**
   - If YES → Measure before/after: `du -sh dist/`. Report in commit message.
   - If NO → Continue.

**If all answers are "NO" or handled → Proceed with implementation.**

---

## Branching strategy

All changes must follow this workflow:

**Never commit directly to `main`.** All changes go through feature branches and pull requests.

### Branch naming conventions

Use conventional names that describe the change type:
- `feat/feature-name` — New feature or functionality
- `fix/bug-description` — Bug fix or patch
- `chore/maintenance-task` — Dependency updates, tooling, refactoring
- `docs/documentation-topic` — Documentation-only changes
- `ci/workflow-description` — CI/CD workflow improvements (requires human review)

### Workflow (agent responsibility)

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make changes** on the feature branch (follow pre-commit validation checklist)

3. **Commit with conventional messages**:
   ```bash
   git commit -m "feat: add new component" 
   git commit -m "fix: resolve routing issue"
   git commit -m "chore: update dependencies"
   ```

4. **Push to feature branch**:
   ```bash
   git push origin feat/your-feature-name
   ```

5. **Create a Pull Request** (PR) on GitHub from feature branch to `main`
   - GitHub Actions will automatically deploy to a preview channel
   - Preview URL will be commented on the PR

6. **Wait for review and merge**:
   - All CI checks must pass (lint, build, no secrets)
   - Preview deployment must succeed
   - Human must review and approve before merging

### When feature branches are NOT required

Documentation-only changes in `docs/` or README.md may be merged directly to `main` after CI validation, if authorized.

### Protection rules

`main` branch is protected:
- Requires PR review before merge
- Requires all CI/CD checks to pass
- Prevents force-pushes
- Direct commits are blocked (use feature branches)

**Agent action:** If a commit to `main` fails or is blocked, create a feature branch instead and open a PR.

---

## Repository facts (update if you fork)

- **Default Firebase Project ID:** `cgi-firebase-accel-ag-01`
- **Node version:** 22.x
- **Package manager:** npm
- **Build output directory:** `dist/` (Vite)
- **Firebase Hosting public directory:** must be `dist`

If this repo is forked, the project ID must be changed and secrets must be re-provisioned.

---

## Quickstart (agent should run these first)

### Local environment
```bash
node -v
npm -v
npm ci
npm run dev
npm run build
npm run preview

Firebase CLI sanity check

firebase --version
firebase projects:list
firebase deploy --only hosting --project cgi-firebase-accel-ag-01

Notes:
	•	npm ci requires package-lock.json.
	•	Prefer firebase deploy --project <id> to avoid accidental deployments.

⸻

Required GitHub secrets (do not alter programmatically)

The following secret(s) are expected to exist in the GitHub repo:
	•	FIREBASE_SERVICE_ACCOUNT
Contents: JSON credentials for a Google Cloud service account with permissions to deploy Firebase Hosting.

If credentials do not work, do not attempt to “fix” by printing or re-creating secrets in code. Document what is missing and request a human to update GitHub secrets.

⸻

CI/CD workflows (expected behavior)

Two workflows must exist under .github/workflows/:
	1.	PR Preview Deployment
	•	Trigger: pull_request
	•	Steps:
	•	checkout
	•	setup node
	•	npm ci
	•	npm run build
	•	deploy to Firebase Hosting preview channel
	•	Requirements:
	•	Must not run with secrets on fork PRs (restrict to same-repo PRs).
	•	Should add concurrency to avoid racing deployments.
	•	Should comment the preview URL on the PR when possible.
	2.	Main / Live Deployment
	•	Trigger: push to main
	•	Steps:
	•	checkout
	•	setup node
	•	npm ci
	•	npm run build
	•	deploy to channelId: live
	•	Requirements:
	•	Must deploy to the correct Firebase project ID.
	•	Should add concurrency to avoid overlapping production deploys.

Workflow conventions
	•	Use actions/setup-node@v4 with node-version: 22 and cache: npm.
	•	Use the Firebase Hosting deploy action (preferred): FirebaseExtended/action-hosting-deploy@v0.
	•	CI must fail clearly if:
	•	package-lock.json is missing
	•	npm run build fails
	•	dist/ is not produced

⸻

Firebase Hosting configuration rules (firebase.json)

SPA rewrites

This repo is a client-routed SPA. Ensure this rewrite exists:

"rewrites": [{ "source": "**", "destination": "/index.html" }]

Hosting public directory

For Vite builds, Hosting must serve from:

"public": "dist"

Do not set Hosting to public/ once the React app is scaffolded, or deployments will publish the wrong content.

Headers & caching (recommended baseline)

Agents may add headers to improve security/performance, but must:
	•	keep changes minimal and reversible
	•	document rationale in the PR description

General guidance:
	•	Avoid long caching on index.html.
	•	Allow long caching for hashed assets (when safe).
	•	Be careful with service worker caching if/when introduced.

⸻

React (Vite) conventions

Scripts

Expected npm scripts (minimum):
	•	dev
	•	build
	•	preview

If adding new scripts, keep naming conventional and document in README.md or docs/.

Routing

If the app uses client-side routing (React Router), the SPA rewrite is mandatory.

⸻

PWA guidance

This repo targets “PWA-capable” architecture. Keep PWA additions minimal and incremental:
	•	A manifest.webmanifest is acceptable.
	•	Icons should be added under the Vite public/ directory.
	•	Service workers should be introduced deliberately; do not add complex offline logic without tests and documentation.

If you introduce a service worker:
	•	confirm update behavior (avoid stale SW pinning users to old versions)
	•	ensure Hosting headers do not prevent SW updates

---

## PWA validation rules

When adding PWA features (manifest, service workers, icons), follow these rules:

### Manifest validation (public/manifest.webmanifest)

Required fields:
- `"name"` – Full app name (human-readable)
- `"short_name"` – ≤12 characters (for homescreen)
- `"start_url"` – Must be `"/"`
- `"display"` – Must be `"standalone"` or `"minimal-ui"`
- `"icons"` – Array with at least 192x192 and 512x512 PNG (192px and 512px)
- `"theme_color"` – Hex color (e.g., `"#000000"`)
- `"background_color"` – Hex color

**Validation command:**
```bash
node -e "const m = require('./public/manifest.webmanifest'); 
const required = ['name', 'short_name', 'start_url', 'display', 'icons']; 
required.forEach(k => { if (!m[k]) console.error('Missing: ' + k); }); 
if (m.icons.length < 2) console.error('Need ≥2 icons');"
```

**Test in browser:**
1. `npm run preview`
2. Open DevTools → Application → Manifest
3. Verify no errors, all fields populated
4. Verify icon sizes: 192px, 512px

---

### Service worker strategy

- **Caching strategy:** Use `"network-first"` or `"cache-first"` ONLY after explicit review
- **Update behavior:** Never pin users to stale service workers. Firebase Hosting auto-invalidates SW cache by default (good).
- **Offline fallback:** Do NOT add offline logic without unit tests and documentation
- **Cache invalidation:** Vite hashes assets automatically; SW should respect hashed filenames

**Testing locally:**
```bash
npm run preview
# Open DevTools → Application → Service Workers
# Verify SW is registered and running
# Test offline: DevTools → Network → Offline, reload page
```

---

### Icons

**Location:** `public/icons/`  
**Formats:** PNG (recommended for PWA compatibility)  
**Minimum sizes:** 192×192 and 512×512  
**Optional sizes:** 144×144, 256×256 for broader device support  

**Validation:**
```bash
for size in 192 512; do
  test -f "public/icons/icon-${size}x${size}.png" && echo "✓ $size×$size icon found" || echo "✗ Missing $size×$size icon";
done
```

---

## Edge cases & gotchas

### Fork PRs and secrets

- Fork PRs intentionally **do NOT** have access to `FIREBASE_SERVICE_ACCOUNT`
- This is a security feature to prevent credential leakage from untrusted code
- Expected: Preview deployment will not run on fork PRs
- Agent action: When PR is from fork, inform user that manual testing is required
- Resolution: Maintainers can merge and test, or contributor pushes to branch on main repo

---

### Preview channel lifecycle

- Preview channels auto-expire after **7 days of inactivity**
- If > 10 previews exist simultaneously, new deployments may fail
- Agent action: If `firebase deploy` fails with "preview channel limit", check Firebase Console
- Resolution: Delete old previews in Firebase Console > Hosting > Channels

---

### Large dependency upgrades

- `npm install` modifies package-lock.json locally
- CI uses `npm ci` (won't update lock file)
- Agent action: If upgrading major/minor versions, must run `npm install` locally and commit lock file
- **Do NOT** attempt to auto-fix lock file conflicts in CI

---

### SPA routing verification

- firebase.json has rewrite: `"source": "**" → "destination": "/index.html"`
- This enables client-side routing (React Router, etc.)
- Agent action: When adding new routes, verify navigating directly to `/new-route` works
- Test: `npm run preview`, navigate to `/some-path` (should load, not 404)

---

### Build output size monitoring

- Changes to dependencies or code can increase bundle size
- Large increases (> 10%) should be flagged in PR description
- Agent action: Measure before/after: `du -sh dist/` and report in commit message
- Example: "chore: update lodash (bundle size: 45KB → 51KB, +13%)"

⸻

## Pre-commit validation checklist

Before staging any changes, verify ALL of these pass locally:

```bash
# Code quality
npm run lint

# Build succeeds
npm run build

# Build output exists and has content
test -f dist/index.html && du -k dist/index.html

# No credentials in staged files
git diff --cached | grep -iE "secret|password|api.?key|token|credential" && echo "ERROR: Found credential in staged files" && exit 1 || echo "✓ No credentials found"

# Lock file exists and is not modified unintentionally
test -f package-lock.json && echo "✓ Lock file exists" || echo "ERROR: Missing package-lock.json"
```

**If any check fails, fix it before committing.**

⸻

## Agent operating procedure

Planning

Before making changes, provide:
	•	intended goal
	•	files to be modified
	•	commands to validate locally
	•	expected CI outcomes

Implementation rules
	•	Prefer minimal diffs.
	•	Do not refactor unrelated code in “setup” PRs.
	•	Use conventional commit messages where possible:
	•	chore: ...
	•	feat: ...
	•	fix: ...
	•	ci: ...
	•	docs: ...

Testing and validation

At minimum, run locally:

npm ci
npm run build

If a Firebase deploy is required for validation, use:

firebase deploy --only hosting --project cgi-firebase-accel-ag-01

Documentation

If CI/CD behavior changes, update or add:
	•	docs/ci-cd.md (recommended)
	•	README.md (short summary)

⸻

## Troubleshooting with recovery procedures

### "npm ci fails: cannot find module or peer dependency error"

**Cause:** package-lock.json is missing, stale, or corrupted.  
**Recovery:**
1. Delete lock file: `rm package-lock.json`
2. Reinstall: `npm install`
3. Verify lock file exists: `test -f package-lock.json && echo "✓"`
4. Commit: `git add package-lock.json && git commit -m "chore: update dependencies"`
5. Push and re-trigger CI

---

### "npm run build fails: syntax error or module not found"

**Cause:** Code syntax error or missing import.  
**Verification:**
1. Check for linting issues: `npm run lint`
2. Review error output in terminal
3. Verify all dependencies installed: `npm ci`

**Common fixes:**
- Syntax error in src/: Fix the error and retry build
- Missing dependency: Run `npm install <package>` and commit package-lock.json
- Relative import error: Check file paths in import statements

---

### "Build succeeds but dist/index.html is missing or empty"

**Cause:** Vite output directory misconfigured or build incomplete.  
**Verification:**
1. Check vite.config.js: `grep 'outDir' vite.config.js | grep dist`
2. Check dist/ exists: `ls -la dist/`
3. Check HTML size: `du -k dist/index.html` (should be > 1KB)

**Common fixes:**
- Verify vite.config.js has `build: { outDir: 'dist' }`
- Delete dist/ and rebuild: `rm -rf dist && npm run build`
- Check for React errors in build output (missing components, syntax)

---

### "Firebase deploy fails: 'Invalid service account' or authentication error"

**Cause:** FIREBASE_SERVICE_ACCOUNT secret is missing, malformed, or invalid.  
**Do NOT attempt to debug or print secrets in code.**  
**Recovery:**
1. Verify the secret exists in GitHub Actions settings: Settings > Secrets and variables > Actions > FIREBASE_SERVICE_ACCOUNT
2. If missing or invalid, contact human to update the secret
3. If updated, re-trigger the failed workflow

---

### "PR Preview deployment doesn't deploy (no comment on PR)"

**Cause:** PR is from a forked repo (intentional security feature).  
**Expected behavior:** Forks cannot deploy because they lack access to FIREBASE_SERVICE_ACCOUNT secret.  
**Resolution:**
- Inform PR author that manual testing is required
- If PR is from main repo branch, check GitHub Actions logs for build/deploy errors
- Common fix: Ensure package-lock.json is committed

---

### "Deploy publishes wrong content (404s or stale files)"

**Cause:** firebase.json uses `"public": "public"` instead of `"dist"`, or dist/ wasn't generated.  
**Verification:**
1. Check firebase.json: `grep '"public"' firebase.json` (should be `"public": "dist"`)
2. Verify dist/ has content: `ls dist/index.html && du -sh dist/`
3. Check for build errors: `npm run build`

**Fix:**
1. Update firebase.json: `"public": "dist"`
2. Rebuild: `npm run build`
3. Deploy: `firebase deploy --only hosting --project cgi-firebase-accel-ag-01`

---

### "Preview channel deployment fails: 'Too many preview channels'"

**Cause:** Firebase Hosting has reached max preview channels (auto-expire after 7 days).  
**Resolution:**
1. Check preview channels in Firebase Console: Hosting > Channels
2. Delete old previews (older than 7 days)
3. Retry deployment

---

### "firebase init hosting:github" fails with IAM/service account errors

**Cause:** This repo is designed to work without Firebase CLI automation for GitHub integration.  
**Fix:** Use manual service account + GitHub secret + workflows approach. Do not run `firebase init hosting:github`.

⸻

Reference links (for humans/agents)

These are authoritative references agents may consult when needed:
	•	Firebase Hosting overview:
https://firebase.google.com/docs/hosting
	•	Preview channels:
https://firebase.google.com/docs/hosting/test-preview-deploy
	•	Firebase CLI:
https://firebase.google.com/docs/cli
	•	Firebase Hosting deploy action:
https://github.com/FirebaseExtended/action-hosting-deploy
	•	GitHub Copilot coding agent instructions (AGENTS.md):
https://docs.github.com/en/copilot/how-tos/use-copilot-agents/configure-copilot-agents

(Do not copy large blocks of text from external docs into this repo.)

---

## Agent success criteria

A change is considered "done" and ready for merge when **ALL** of these are true:

### 1. Local validation passes
- `npm ci` succeeds (no dependency errors)
- `npm run lint` succeeds (no linting errors)
- `npm run build` succeeds (no build errors)
- `dist/index.html` exists and size > 1KB: `test -f dist/index.html && du -k dist/index.html`

### 2. Code quality
- Follows conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `ci:`, etc.
- No new `console.error()` or unresolved `TODO` comments
- No dead code or commented-out lines
- No secrets in git history

### 3. No regressions
- Existing functionality still works after changes
- No new errors in browser console
- Bundle size increase < 10% (or justified in commit message)

### 4. Documentation updated (if applicable)
- If behavior changed → README.md or docs/ updated
- If CI/CD changed → docs/ci-cd.md updated
- Commit message explains the "why", not just the "what"

### 5. PR ready for merge
- All CI/CD checks pass (green checkmarks on GitHub)
- No failing tests or build errors
- Preview deployment successful (if not on fork PR)
- PR description includes: Goal, Files Changed, Validation Commands (if needed)

### 6. Repository baseline state
- `package.json` + `package-lock.json` committed
- `npm run build` produces `dist/`
- `firebase.json` has:
  - `"public": "dist"`
  - SPA rewrite to `/index.html`
- GitHub Actions workflows:
  - PR preview workflow succeeds and comments preview URL
  - Main/live deploy workflow succeeds and deploys to `live` channel
- No credentials committed to git

---

## Quick reference: Common agent tasks

| Task | Command | Success Indicator |
|------|---------|-------------------|
| **Check environment** | `node -v && npm -v && firebase --version` | v22.x, v10.x, v13.x+ |
| **Install dependencies** | `npm ci` | `added X packages, audited Y packages` |
| **Lint code** | `npm run lint` | Exit code 0, no errors |
| **Build app** | `npm run build` | `dist/index.html` exists, < 2 minutes |
| **Test preview** | `npm run preview` | Runs on http://localhost:4173, loads |
| **Validate no secrets** | `git diff --cached \| grep -iE 'secret\|password\|api'` | No output (no matches) |
| **Check lock file** | `test -f package-lock.json && echo "✓"` | Output: ✓ |
| **Verify dist size** | `du -sh dist/` | Size > 1MB total (typical) |
| **Deploy to preview** | `firebase deploy --only hosting --project cgi-firebase-accel-ag-01` | "Deploy complete!" |
| **Deploy to live** | `firebase deploy --only hosting --project cgi-firebase-accel-ag-01 --channel live` | "Deploy complete!", live URL |

⸻

## When to update AGENTS.md

Update this file when:
- Node.js version changes (update minimum version requirement)
- Firebase project ID changes
- New CI/CD workflows are added or modified
- Security-critical changes or new non-negotiables are discovered
- Agent decision procedures need clarification

**Do NOT update this file for:**
- Typo fixes (submit via standard PR)
- General README.md updates
- Code changes that don't affect agent workflow

**Important:** Changes to AGENTS.md MUST be human-reviewed before merging.

