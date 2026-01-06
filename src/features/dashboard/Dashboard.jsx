import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Avatar,
  Stack,
  Paper,
  Divider,
} from '@mui/material'
import {
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  Warning as WarningIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material'
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../auth/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const [todayTasks, setTodayTasks] = useState([])
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [stats, setStats] = useState({
    completedToday: 0,
    overdueCount: 0,
    upcomingCount: 0,
  })

  // Fetch today's tasks
  useEffect(() => {
    if (!user) return
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const q = query(
      collection(db, 'tasks'),
      where('dueDate', '>=', today.toISOString().split('T')[0]),
      where('dueDate', '<', tomorrow.toISOString().split('T')[0]),
      orderBy('dueDate'),
      limit(10)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setTodayTasks(tasks)

      // Calculate stats
      const completed = tasks.filter(t => t.completed).length
      setStats(prev => ({ ...prev, completedToday: completed }))
    })

    return () => unsubscribe()
  }, [user])

  // Fetch upcoming events
  useEffect(() => {
    if (!user) return
    const today = new Date().toISOString().split('T')[0]
    const weekFromNow = new Date()
    weekFromNow.setDate(weekFromNow.getDate() + 7)

    const q = query(
      collection(db, 'events'),
      where('date', '>=', today),
      where('date', '<=', weekFromNow.toISOString().split('T')[0]),
      orderBy('date'),
      orderBy('startTime'),
      limit(5)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const events = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          time: data.startTime ? formatTime(data.startTime) : '',
          color: getPersonColor(data.person),
        }
      })
      setUpcomingEvents(events)
      setStats(prev => ({ ...prev, upcomingCount: events.length }))
    })

    return () => unsubscribe()
  }, [user])

  // Fetch overdue tasks count
  useEffect(() => {
    if (!user) return
    const today = new Date().toISOString().split('T')[0]

    const q = query(
      collection(db, 'tasks'),
      where('completed', '==', false),
      where('dueDate', '<', today)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setStats(prev => ({ ...prev, overdueCount: snapshot.size }))
    })

    return () => unsubscribe()
  }, [user])

  const formatTime = (time) => {
    if (!time) return ''
    const [hours, minutes] = time.split(':')
    const h = parseInt(hours)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const displayHour = h % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getPersonColor = (personName) => {
    const colors = {
      'Mom': '#3B82F6',
      'Dad': '#8B5CF6',
      'Emma': '#10B981',
      'Liam': '#F59E0B',
    }
    return colors[personName] || '#6B7280'
  }

  const StatCard = ({ icon, label, value, color }) => (
    <Card>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
          <Box>
            <Typography variant="h3" fontWeight="bold">
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h2" gutterBottom fontWeight="bold">
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Typography>
      </Box>

      {/* Stats Row */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={3}
        sx={{ mb: 4 }}
      >
        <Box sx={{ flex: 1 }}>
          <StatCard
            icon={<CheckCircleIcon />}
            label="Completed Today"
            value={stats.completedToday}
            color="success.main"
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <StatCard
            icon={<WarningIcon />}
            label="Overdue Tasks"
            value={stats.overdueCount}
            color="error.main"
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <StatCard
            icon={<AccessTimeIcon />}
            label="Upcoming"
            value={stats.upcomingCount}
            color="primary.main"
          />
        </Box>
      </Stack>

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom fontWeight="600">
          Quick Actions
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="large"
            sx={{ flex: { xs: '1 1 100%', sm: '0 1 auto' } }}
          >
            Add Task
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<CalendarIcon />}
            size="large"
            sx={{ flex: { xs: '1 1 100%', sm: '0 1 auto' } }}
          >
            New Event
          </Button>
          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            size="large"
            sx={{ flex: { xs: '1 1 100%', sm: '0 1 auto' } }}
          >
            Manage Rooms
          </Button>
        </Stack>
      </Paper>

      {/* Main Content Grid */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        alignItems="stretch"
      >
        {/* Today's Tasks */}
        <Box sx={{ flex: { xs: 1, md: 2 } }}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" fontWeight="600">
                  Today's Tasks
                </Typography>
                <Chip label={`${todayTasks.length} tasks`} color="primary" size="small" />
              </Stack>
              <List>
                {todayTasks.map((task, index) => (
                  <Box key={task.id}>
                    <ListItem
                      secondaryAction={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip label={task.room} size="small" variant="outlined" />
                          <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem' }}>
                            {task.assignee[0]}
                          </Avatar>
                        </Stack>
                      }
                      disablePadding
                    >
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={task.completed}
                          tabIndex={-1}
                          disableRipple
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={task.title}
                        secondary={task.assignee}
                        primaryTypographyProps={{
                          style: {
                            textDecoration: task.completed ? 'line-through' : 'none',
                            color: task.completed ? '#9CA3AF' : 'inherit',
                          },
                        }}
                      />
                    </ListItem>
                    {index < todayTasks.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
              {todayTasks.length === 0 && (
                <Box textAlign="center" py={4}>
                  <Typography variant="body2" color="text.secondary">
                    No tasks for today! 🎉
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Upcoming Events */}
        <Box sx={{ flex: { xs: 1, md: 1 } }}>
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight="600" mb={2}>
                Upcoming Events
              </Typography>
              <Stack spacing={2}>
                {upcomingEvents.map((event) => (
                  <Paper key={event.id} sx={{ p: 2, borderLeft: `4px solid ${event.color}` }}>
                    <Typography variant="body1" fontWeight="600">
                      {event.title}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                      <AccessTimeIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {event.time}
                      </Typography>
                      <Chip
                        label={event.person}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Stack>
                  </Paper>
                ))}
              </Stack>
              {upcomingEvents.length === 0 && (
                <Box textAlign="center" py={4}>
                  <Typography variant="body2" color="text.secondary">
                    No upcoming events
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Household Summary */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" mb={2}>
                Family Activity
              </Typography>
              <Stack spacing={2}>
                {['Mom', 'Dad', 'Emma', 'Liam'].map((person, i) => (
                  <Stack key={person} direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar sx={{ width: 32, height: 32, bgcolor: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'][i] }}>
                        {person[0]}
                      </Avatar>
                      <Typography variant="body2">{person}</Typography>
                    </Stack>
                    <Chip
                      label={`${Math.floor(Math.random() * 5)} tasks`}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Stack>
    </Container>
  )
}
