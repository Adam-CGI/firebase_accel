import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { auth } from '../../firebase.js'
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult,
  signOut as fbSignOut
} from 'firebase/auth'
import { ALLOWLIST } from '../../config/allowlist.js'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Handle redirect result on page load
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          console.log('Sign-in successful:', result.user.email)
        }
      })
      .catch((error) => {
        console.error('Sign-in error:', error)
        setError(error.message)
      })

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const signIn = async () => {
    try {
      setError(null)
      const provider = new GoogleAuthProvider()
      // Use redirect instead of popup for better compatibility
      await signInWithRedirect(auth, provider)
    } catch (err) {
      console.error('Sign-in error:', err)
      setError(err.message)
    }
  }

  const signOut = async () => {
    try {
      await fbSignOut(auth)
    } catch (err) {
      console.error('Sign-out error:', err)
      setError(err.message)
    }
  }

  const isAllowed = useMemo(() => {
    if (!user) return false
    const email = user.email || ''
    return ALLOWLIST.includes(email)
  }, [user])

  const value = { user, loading, isAllowed, signIn, signOut, error }
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
