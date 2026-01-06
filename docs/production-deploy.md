# Production Deployment Checklist

## ✅ Completed

- [x] Created `.env` with production Firebase credentials
- [x] Updated `allowlist.js` with your Gmail address
- [x] Updated `firestore.rules` with collection-specific rules
- [x] Enabled real Firestore queries in all components
- [x] Removed all mock data

## 🚀 Next Steps

### 1. Build and Test Locally
```bash
npm run build
npm run preview
```

### 2. Deploy Firestore Rules First
```bash
firebase deploy --only firestore:rules --project cgi-firebase-accel-ag-01
```

### 3. Create Allowlist in Firebase Console
**Option A: Via Firebase Console**
1. Go to https://console.firebase.google.com
2. Select project: `cgi-firebase-accel-ag-01`
3. Go to Firestore Database
4. Create collection: `allowlist`
5. Add document with ID = your email (e.g., `adam.gillespie@gmail.com`)
6. Add field: `addedAt` (timestamp) = current date

**Option B: Via Firebase CLI**
```bash
firebase firestore:set allowlist/adam.gillespie@gmail.com '{"addedAt":"2026-01-06"}' --project cgi-firebase-accel-ag-01
```

### 4. Configure Google Auth for Production
1. Go to Firebase Console → Authentication → Settings
2. Click "Authorized domains"
3. Add:
   - `cgi-firebase-accel-ag-01.web.app`
   - `cgi-firebase-accel-ag-01.firebaseapp.com`
4. Go to Authentication → Sign-in method
5. Ensure Google provider is enabled

### 5. Deploy to Preview Channel
```bash
npm run build
firebase hosting:channel:deploy production-test --project cgi-firebase-accel-ag-01 --expires 7d
```

This will give you a preview URL like:
`https://cgi-firebase-accel-ag-01--production-test-<hash>.web.app`

### 6. Test on Preview URL
- [ ] Sign in with Google (your allowlisted email)
- [ ] Create a family member in People page
- [ ] Create a room in Rooms page
- [ ] Add a task in Tasks page
- [ ] Add an event in Week calendar
- [ ] Verify all CRUD operations work
- [ ] Check that data persists after refresh

### 7. Deploy to Production
```bash
firebase deploy --only hosting,firestore --project cgi-firebase-accel-ag-01
```

Production URL: `https://cgi-firebase-accel-ag-01.web.app`

## 🔍 Verification

After deployment, verify:
- [ ] Google Sign-in works with allowlisted email
- [ ] Non-allowlisted emails are blocked
- [ ] All pages load without errors
- [ ] Firestore CRUD operations work
- [ ] Navigation works (desktop and mobile)
- [ ] No console errors in browser DevTools

## 🐛 Troubleshooting

### "Cannot read from Firestore"
- Check Firestore rules are deployed
- Verify collections exist (create via console or app)
- Check browser console for specific errors

### "Sign-in redirect fails"
- Verify authorized domains in Firebase Console
- Clear browser cache and cookies
- Try incognito/private browsing mode

### "Access denied after sign-in"
- Verify your email is in allowlist collection
- Check Firestore rules have allowlist function
- Ensure email in allowlist matches sign-in email exactly

### "Index required" error
- Click the link in the error message to create index
- Or create manually in Firebase Console → Firestore → Indexes

## 📝 Notes

- Preview channels expire after 7 days (default)
- Build output: ~905KB JS bundle (275KB gzipped)
- Emulators only run in development (`npm run dev`)
- Production uses real Firebase services
