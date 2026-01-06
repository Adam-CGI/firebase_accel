#!/usr/bin/env node

/**
 * Production Setup Script
 * Run this after deploying to production to initialize Firestore
 * Usage: node scripts/setup-production.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, setDoc, doc } from 'firebase/firestore';
import readline from 'readline';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupAllowlist() {
  console.log('\n📧 Setting up allowlist...');
  const email = await question('Enter your Gmail address: ');
  
  try {
    await setDoc(doc(db, 'allowlist', email), {
      addedAt: new Date().toISOString(),
      addedBy: 'setup-script',
    });
    console.log(`✅ Added ${email} to allowlist`);
  } catch (error) {
    console.error('❌ Error adding to allowlist:', error.message);
  }
}

async function setupSamplePeople() {
  console.log('\n👥 Setting up sample family members...');
  const addSamples = await question('Add sample people (Mom, Dad, Emma, Liam)? (y/n): ');
  
  if (addSamples.toLowerCase() === 'y') {
    const people = [
      { name: 'Mom', role: 'Parent', color: '#3B82F6' },
      { name: 'Dad', role: 'Parent', color: '#8B5CF6' },
      { name: 'Emma', role: 'Child', color: '#10B981' },
      { name: 'Liam', role: 'Child', color: '#F59E0B' },
    ];

    for (const person of people) {
      try {
        await addDoc(collection(db, 'people'), {
          ...person,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        console.log(`✅ Added ${person.name}`);
      } catch (error) {
        console.error(`❌ Error adding ${person.name}:`, error.message);
      }
    }
  }
}

async function setupSampleRooms() {
  console.log('\n🏠 Setting up sample rooms...');
  const addSamples = await question('Add sample rooms? (y/n): ');
  
  if (addSamples.toLowerCase() === 'y') {
    const rooms = ['Kitchen', 'Living Room', 'Bedroom', 'Bathroom', 'Study', 'Garage'];

    for (const room of rooms) {
      try {
        await addDoc(collection(db, 'rooms'), {
          name: room,
          sortOrder: Date.now(),
          isArchived: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        console.log(`✅ Added ${room}`);
      } catch (error) {
        console.error(`❌ Error adding ${room}:`, error.message);
      }
    }
  }
}

async function main() {
  console.log('🚀 Firebase Production Setup');
  console.log('============================\n');
  console.log('Project:', firebaseConfig.projectId);
  
  try {
    await setupAllowlist();
    await setupSamplePeople();
    await setupSampleRooms();
    
    console.log('\n✨ Setup complete!');
    console.log('\nNext steps:');
    console.log('1. Verify allowlist in Firebase Console');
    console.log('2. Test sign-in with your Gmail account');
    console.log('3. Deploy Firestore rules: firebase deploy --only firestore:rules');
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

main();
