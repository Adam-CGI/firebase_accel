# Firebase Authentication Setup

## For Development (Emulators)

1. **Start Firebase Emulators:**
   ```bash
   npm run emulators:all
   ```

2. **Access the app:**
   - Open http://localhost:5173
   - The emulators run on:
     - Auth: http://127.0.0.1:9099
     - Firestore: http://127.0.0.1:8080
     - UI: http://127.0.0.1:4000

3. **Sign in:**
   - Click "Sign in with Google"
   - In emulator mode, you can use any email - no real Google account needed
   - The auth emulator will redirect to your dev URL automatically

## For Production Deployment

### 1. Configure Authorized Domains

Go to [Firebase Console](https://console.firebase.google.com):

1. Select your project (`cgi-firebase-accel-ag-01`)
2. Go to **Authentication** → **Settings** → **Authorized domains**
3. Add your production domain(s):
   - `your-app-name.web.app` (Firebase Hosting default)
   - `your-custom-domain.com` (if using custom domain)

### 2. Enable Google Sign-In

1. In Firebase Console → **Authentication** → **Sign-in method**
2. Enable **Google** provider
3. Configure:
   - Project support email
   - App name (shows in OAuth consent screen)

### 3. OAuth Consent Screen (Google Cloud Console)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Navigate to **APIs & Services** → **OAuth consent screen**
4. Configure:
   - User type: External (for public access) or Internal (for workspace only)
   - App information
   - Authorized domains
   - Scopes (email, profile are sufficient)

### 4. Update Environment Variables

Create a `.env.production` file (or set in Vite/Firebase hosting config):

```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=cgi-firebase-accel-ag-01
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=1:791451436048:web:03dc70808acc83d771b695
```

## Common Issues & Fixes

### Issue: "Redirect URI mismatch" or "unauthorized_client"
**Fix:** Add your domain to:
- Firebase Console → Authentication → Authorized domains
- Google Cloud Console → OAuth consent screen → Authorized domains

### Issue: Sign-in works but redirects to localhost
**Fix:** In production, ensure `authDomain` in firebase config matches your hosting domain

### Issue: "This app is blocked"
**Fix:** 
- Complete OAuth consent screen configuration in Google Cloud Console
- If using External user type, you may need to verify your app
- For testing, add test users in OAuth consent screen

### Issue: Sign-in works in emulator but not production
**Fix:**
1. Check `firebase.json` - ensure `authDomain` is not set to emulator
2. Verify environment variables are correctly set for production
3. Clear browser cache and try again

## Testing Auth Flow

### Development:
```bash
npm run emulators:all
npm run dev
# Visit http://localhost:5173
```

### Production Preview:
```bash
npm run build
firebase hosting:channel:deploy preview
# Visit the preview URL provided
```

## Security Best Practices

1. **Allowlist Management:**
   - Update `src/config/allowlist.js` with authorized emails
   - Consider moving allowlist to Firestore for dynamic management

2. **Firestore Rules:**
   - Ensure `firestore.rules` checks allowlist
   - Never expose sensitive data without proper rules

3. **Environment Variables:**
   - Never commit `.env` files
   - Use Firebase Hosting environment config for production

## Switching Between Popup and Redirect

Current implementation uses `signInWithRedirect` for better compatibility. To use popup instead:

In `src/features/auth/AuthContext.jsx`, replace:
```javascript
await signInWithRedirect(auth, provider)
```
with:
```javascript
await signInWithPopup(auth, provider)
```

**Note:** Popups may be blocked by browsers or fail on mobile. Redirect is recommended for production.
