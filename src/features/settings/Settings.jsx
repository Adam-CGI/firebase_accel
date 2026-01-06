import { useState } from 'react'
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  Divider,
  Alert,
  AlertTitle,
  Chip,
} from '@mui/material'
import {
  Person as PersonIcon,
  Home as HomeIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Security as SecurityIcon,
  Info as InfoIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

export default function Settings() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)

  const settingsSections = [
    {
      title: 'Family & Household',
      items: [
        {
          icon: <PersonIcon />,
          label: 'Family Members',
          description: 'Manage people, roles, and colors',
          action: () => navigate('/people'),
        },
        {
          icon: <HomeIcon />,
          label: 'Rooms & Spaces',
          description: 'Edit rooms and locations',
          action: () => navigate('/rooms'),
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: <NotificationsIcon />,
          label: 'Notifications',
          description: 'Task reminders and event alerts',
          toggle: true,
          value: notifications,
          onChange: setNotifications,
        },
        {
          icon: <PaletteIcon />,
          label: 'Dark Mode',
          description: 'Switch to dark theme',
          toggle: true,
          value: darkMode,
          onChange: setDarkMode,
        },
      ],
    },
  ]

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h2" fontWeight="bold" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your household planner preferences
        </Typography>
      </Box>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle>Development Mode</AlertTitle>
        Currently using Firebase emulators and mock data. Some features require Firebase
        collections to be created.
      </Alert>

      {/* Settings Sections */}
      <Stack spacing={3}>
        {settingsSections.map((section) => (
          <Box key={section.title}>
            <Typography variant="h6" fontWeight="600" mb={2}>
              {section.title}
            </Typography>
            <Card>
              <List disablePadding>
                {section.items.map((item, index) => (
                  <Box key={item.label}>
                    <ListItem
                      button={!item.toggle}
                      onClick={!item.toggle ? item.action : undefined}
                      secondaryAction={
                        item.toggle ? (
                          <Switch
                            checked={item.value}
                            onChange={(e) => item.onChange(e.target.checked)}
                          />
                        ) : (
                          <ChevronRightIcon color="action" />
                        )
                      }
                    >
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        secondary={item.description}
                      />
                    </ListItem>
                    {index < section.items.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </Card>
          </Box>
        ))}

        {/* App Info */}
        <Box>
          <Typography variant="h6" fontWeight="600" mb={2}>
            About
          </Typography>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Version
                  </Typography>
                  <Chip label="0.0.0" size="small" />
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Environment
                  </Typography>
                  <Chip label={import.meta.env.DEV ? 'Development' : 'Production'} size="small" color="primary" />
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Firebase Project
                  </Typography>
                  <Typography variant="body2" fontWeight="600">
                    {import.meta.env.VITE_FIREBASE_PROJECT_ID || 'Not configured'}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Stack>
    </Container>
  )
}
