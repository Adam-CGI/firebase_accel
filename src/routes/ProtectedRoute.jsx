import { Navigate } from 'react-router-dom'
import { Box, Container, Typography, CircularProgress, Paper, Stack, Alert } from '@mui/material'
import { Lock as LockIcon, Person as PersonIcon } from '@mui/icons-material'
import { useAuth } from '../features/auth/AuthContext.jsx'

export default function ProtectedRoute({ children }) {
  const { user, loading, isAllowed, error } = useAuth()

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary" mt={2}>
            Loading…
          </Typography>
        </Box>
      </Container>
    )
  }

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Stack spacing={2} alignItems="center">
            <PersonIcon sx={{ fontSize: 80, color: 'primary.main' }} />
            <Typography variant="h4" fontWeight="bold">
              Sign-in Required
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Please sign in with Google to continue.
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mt: 2, textAlign: 'left' }}>
                <Typography variant="body2">{error}</Typography>
                <Typography variant="caption" display="block" mt={1}>
                  If using emulators, ensure they are running. For production, ensure your domain is authorized in Firebase Console.
                </Typography>
              </Alert>
            )}
          </Stack>
        </Paper>
      </Container>
    )
  }

  if (!isAllowed) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Stack spacing={2} alignItems="center">
            <LockIcon sx={{ fontSize: 80, color: 'error.main' }} />
            <Typography variant="h4" fontWeight="bold">
              Access Not Allowed
            </Typography>
            <Typography variant="body1" color="text.secondary">
              This app is restricted to an allowlisted household.
            </Typography>
            <Alert severity="info" sx={{ mt: 2, textAlign: 'left' }}>
              <Typography variant="body2">
                Your email: <strong>{user.email}</strong>
              </Typography>
              <Typography variant="caption" display="block" mt={1}>
                Contact the administrator to be added to the allowlist.
              </Typography>
            </Alert>
          </Stack>
        </Paper>
      </Container>
    )
  }

  return children
}
