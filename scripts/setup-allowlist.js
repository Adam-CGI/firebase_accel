#!/usr/bin/env node

/**
 * Setup script to populate the Firestore allowlist collection
 * Run this once to enable access for allowlisted users
 * 
 * Usage:
 *   node scripts/setup-allowlist.js
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { ALLOWLIST } from '../src/config/allowlist.js'

// Your Firebase config - this should match src/firebase.js
const firebaseConfig = {
  apiKey: "AIzaSyBOuqTWnvFDgQYxwLxJ7CRGSmEpWDL1Qic",
  authDomain: "cgi-firebase-accel-ag-01.firebaseapp.com",
  projectId: "cgi-firebase-accel-ag-01",
  storageBucket: "cgi-firebase-accel-ag-01.firebasestorage.app",
  messagingSenderId: "1011682030990",
  appId: "1:1011682030990:web:c8a9e6ff3eb5e51a0ff1b5"
}

async function setupAllowlist() {
  console.log('🚀 Initializing Firebase...')
  const app = initializeApp(firebaseConfig)
  const db = getFirestore(app)

  console.log(`📝 Adding ${ALLOWLIST.length} email(s) to allowlist collection...\n`)

  for (const email of ALLOWLIST) {
    try {
      await setDoc(doc(db, 'allowlist', email), {
        email: email,
        addedAt: serverTimestamp(),
        addedBy: 'setup-script'
      })
      console.log(`✅ Added: ${email}`)
    } catch (error) {
      console.error(`❌ Failed to add ${email}:`, error.message)
    }
  }

  console.log('\n✨ Allowlist setup complete!')
  console.log('🔐 Users can now authenticate and access Firestore collections.')
  process.exit(0)
}

setupAllowlist().catch((error) => {
  console.error('❌ Setup failed:', error)
  process.exit(1)
})
