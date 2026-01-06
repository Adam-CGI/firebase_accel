# Firebase Hosting + React (Vite) PWA CI/CD Setup

This document describes the GitHub Actions CI/CD pipeline configured for Firebase Hosting deployments.

## Overview

The repository uses two GitHub Actions workflows to automate Firebase Hosting deployments:

1. **PR Preview Deployments** – Triggered on pull requests to main
2. **Live Deployments** – Triggered on pushes to main

## Prerequisites

### Required GitHub Secrets

The following secrets must be configured in the repository settings (**Settings > Secrets and variables > Actions**):

| Secret Name | Description |
|------------|-------------|
| `FIREBASE_SERVICE_ACCOUNT` | Firebase service account JSON (base64-encoded or raw JSON). Obtained from Firebase Console under **Project Settings > Service Accounts**. |
| `GITHUB_TOKEN` | Automatically provided by GitHub Actions (used for PR preview comments). |

### Required Firebase Configuration

- **Project ID**: `cgi-firebase-accel-ag-01`
- **Firebase CLI**: Installed locally for manual deployments (optional)
- **Service Account**: Created in Firebase Console with Firebase Hosting Admin permissions

## Workflow Files

### 1. PR Preview Deployment

**File**: `.github/workflows/firebase-hosting-pull-request.yml`

- **Trigger**: Pull requests to main
- **Actions**:
  1. Checks out the PR branch
  2. Sets up Node.js v22 with npm caching
  3. Runs `npm ci` (clean install)
  4. Builds the app with `npm run build`
  5. Deploys to a preview channel using FirebaseExtended/action-hosting-deploy
  6. Posts the preview URL as a comment on the PR
  7. Preview expires after 7 days

- **Safety Features**:
  - `if: ${{ github.event.pull_request.head.repo.full_name == github.repository }}` — Prevents secrets from leaking to fork PRs
  - Concurrency limits to avoid duplicate deployments for force-pushes

### 2. Live Deployment

**File**: `.github/workflows/firebase-hosting-merge.yml`

- **Trigger**: Pushes to main branch
- **Actions**:
  1. Checks out the main branch
  2. Sets up Node.js v22 with npm caching
  3. Runs `npm ci` and `npm run build`
  4. Deploys to the live channel (production)
  5. No expiry (live deployment)

- **Safety Features**:
  - Only runs on main branch
  - Concurrency group prevents simultaneous deployments

## Local Development

### Prerequisites

- **Node.js**: v22.x (use `nvm use` if configured)
- **npm**: v10.x or later
- **Firebase CLI**: Install with `npm install -g firebase-tools`

### Setup

```bash
# Install dependencies
npm ci

# (Optional) Set the Firebase project
firebase use cgi-firebase-accel-ag-01

# Development server
npm run dev

# Build for production
npm run build

# Preview the production build locally
npm run preview
```

### Manual Deployment

```bash
# Deploy to Firebase Hosting (requires FIREBASE_SERVICE_ACCOUNT or active gcloud auth)
npm run build
firebase deploy --project cgi-firebase-accel-ag-01
```

## Firebase Configuration

The repository includes two key Firebase configuration files:

### `firebase.json`

Configures Firebase Hosting to serve a React SPA:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

**Key Settings**:
- `"public": "dist"` – Vite build output directory
- `"rewrites"` – Routes all non-file requests to `index.html` (SPA pattern)

### `.firebaserc`

Binds the repository to the Firebase project:

```json
{
  "projects": {
    "default": "cgi-firebase-accel-ag-01"
  }
}
```

## PWA Configuration

A minimal Progressive Web App (PWA) manifest is included:

- **File**: `public/manifest.webmanifest`
- **Icons**: `public/icons/icon-192.png` (192×192) and `icon-512.png` (512×512)
- **Theme Color**: `#1976d2` (defined in HTML meta tag and manifest)

To enhance the PWA, update the manifest and replace placeholder icons with your app's branding.

## Troubleshooting

### Build Fails in GitHub Actions

1. Check that `npm ci` completes successfully (requires valid `package-lock.json`)
2. Ensure `npm run build` produces `dist/index.html`
3. Verify Node.js version is v22.x in the workflow files

### Deploy Fails with "Authorization failed" / "PERMISSION_DENIED"

**Error**: `Authorization failed. This account is missing the following required permissions on project cgi-firebase-accel-ag-01`

**Cause**: The service account in the `FIREBASE_SERVICE_ACCOUNT` secret lacks the required Firebase IAM permissions.

**Solution**: Update the service account's IAM role in the Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com) > **Project Settings** > **Service Accounts**
2. Find the service account used in the `FIREBASE_SERVICE_ACCOUNT` secret (email format: `*@*.iam.gserviceaccount.com`)
3. Click on the service account to open it in Google Cloud Console
4. In the Google Cloud Console (**IAM & Admin** > **IAM**):
   - Ensure the service account has one of these roles:
     - `Firebase Admin` (full access) — **Recommended**
     - `Firebase Hosting Admin` (hosting-only access)
     - Or custom roles with permissions: `firebase.projects.get`, `firebasehosting.sites.update`, `firebasehosting.sites.create`
5. Save and wait 30–60 seconds for permissions to propagate
6. Retry the workflow

**Verify locally**:
```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
firebase deploy --project cgi-firebase-accel-ag-01 --debug
```

### Preview Not Posted to PR

1. Ensure `FIREBASE_SERVICE_ACCOUNT` secret is set correctly and has proper permissions (see above)
2. Check that the PR branch is in the same repository (not a fork)
3. Verify the Firebase project ID matches `cgi-firebase-accel-ag-01`
4. Check GitHub Actions logs for specific error messages

### Manual Deploy Fails

1. Authenticate with Firebase:
   ```bash
   firebase login
   # or use a service account JSON file
   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
   ```
2. Verify the service account has Firebase Hosting Admin permissions (see "Deploy Fails with Authorization" above)
3. Run `firebase use cgi-firebase-accel-ag-01` to set the project
4. Run `firebase deploy --debug` to see detailed error output

## Links

- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [Vite Documentation](https://vitejs.dev)
- [GitHub Actions: Using Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

## Next Steps

1. Customize the React app in `src/App.jsx`
2. Replace PWA icons in `public/icons/` with your branding
3. Update `public/manifest.webmanifest` with your app's metadata
4. (Optional) Add Firebase SDK integration for Authentication, Firestore, etc.
