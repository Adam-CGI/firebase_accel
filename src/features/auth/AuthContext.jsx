import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { auth } from '../../firebase.js'
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithRedirect,
  signInWithPopup,
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
    console.log('[AuthContext] Initializing auth...')
    
    // Handle redirect result on page load
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          console.log('[AuthContext] Sign-in successful:', result.user.email)
        } else {
          console.log('[AuthContext] No pending redirect result')
        }
      })
      .catch((error) => {
        console.error('[AuthContext] Sign-in error:', error)
        setError(error.message)
      })

    const unsub = onAuthStateChanged(auth, (u) => {
      console.log('[AuthContext] Auth state changed:', u ? u.email : 'no user')
      setUser(u || null)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const signIn = async () => {
    try {
      console.log('[AuthContext] Starting sign-in...')
      setError(null)
      const provider = new GoogleAuthProvider()
      
      // Try popup first (more reliable), fallback to redirect if blocked
      try {
        console.log('[AuthContext] Attempting popup sign-in...')
        const result = await signInWithPopup(auth, provider)
        console.log('[AuthContext] Popup sign-in successful:', result.user.email)
      } catch (popupError) {
        console.log('[AuthContext] Popup blocked or failed, trying redirect...', popupError.code)
        if (popupError.code === 'auth/popup-blocked' || popupError.code === 'auth/popup-closed-by-user') {
          console.log('[AuthContext] Using redirect instead...')
          await signInWithRedirect(auth, provider)
          console.log('[AuthContext] Redirect initiated')
        } else {
          throw popupError
        }
      }
    } catch (err) {
      console.error('[AuthContext] Sign-in error:', err)
      console.error('[AuthContext] Error code:', err.code)
      console.error('[AuthContext] Error message:', err.message)
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
