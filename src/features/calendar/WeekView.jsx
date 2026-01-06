import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Stack,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material'
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  Today as TodayIcon,
} from '@mui/icons-material'
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where, orderBy, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../auth/AuthContext'

export default function WeekView() {
  const { user } = useAuth()
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [events, setEvents] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: '',
    person: '',
    date: '',
    startTime: '',
    endTime: '',
    description: '',
  })

  const people = [
    { name: 'Mom', color: '#3B82F6' },
    { name: 'Dad', color: '#8B5CF6' },
    { name: 'Emma', color: '#10B981' },
    { name: 'Liam', color: '#F59E0B' },
  ]

  // Get start and end of current week
  const getWeekDates = (date) => {
    const curr = new Date(date)
    const first = curr.getDate() - curr.getDay() // First day is Sunday
    const days = []
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(curr.setDate(first + i))
      days.push(day)
    }
    return days
  }

  const weekDates = getWeekDates(currentWeek)

  // Fetch events from Firestore
  useEffect(() => {
    if (!user) return
    const startOfWeek = weekDates[0]
    const endOfWeek = weekDates[6]
    const q = query(
      collection(db, 'events'),
      where('date', '>=', startOfWeek.toISOString().split('T')[0]),
      where('date', '<=', endOfWeek.toISOString().split('T')[0]),
      orderBy('date'),
      orderBy('startTime')
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setEvents(eventsData)
    })
    return () => unsubscribe()
  }, [currentWeek, user])

  const handlePreviousWeek = () => {
    const prev = new Date(currentWeek)
    prev.setDate(prev.getDate() - 7)
    setCurrentWeek(prev)
  }

  const handleNextWeek = () => {
    const next = new Date(currentWeek)
    next.setDate(next.getDate() + 7)
    setCurrentWeek(next)
  }

  const handleToday = () => {
    setCurrentWeek(new Date())
  }

  const handleAddEvent = async () => {
    if (!newEvent.title.trim() || !newEvent.person || !newEvent.date) return

    try {
      await addDoc(collection(db, 'events'), {
        ...newEvent,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      
      setOpenDialog(false)
      setNewEvent({
        title: '',
        person: '',
        date: '',
        startTime: '',
        endTime: '',
        description: '',
      })
    } catch (error) {
      console.error('Error adding event:', error)
    }
  }

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    return events.filter((event) => event.date === dateStr)
  }

  const formatTime = (time) => {
    if (!time) return ''
    const [hours, minutes] = time.split(':')
    const h = parseInt(hours)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const displayHour = h % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getPersonColor = (personName) => {
    return people.find((p) => p.name === personName)?.color || '#6B7280'
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h2" fontWeight="bold" gutterBottom>
            Week Calendar
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Family schedule and events
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="large"
          onClick={() => setOpenDialog(true)}
        >
          Add Event
        </Button>
      </Stack>

      {/* Week Navigation */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton onClick={handlePreviousWeek}>
                <ChevronLeftIcon />
              </IconButton>
              <Typography variant="h5" fontWeight="600" sx={{ minWidth: 250, textAlign: 'center' }}>
                {weekDates[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Typography>
              <IconButton onClick={handleNextWeek}>
                <ChevronRightIcon />
              </IconButton>
            </Stack>
            <Button
              variant="outlined"
              startIcon={<TodayIcon />}
              onClick={handleToday}
            >
              Today
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Week Grid */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ flexWrap: { sm: 'wrap', lg: 'nowrap' } }}
      >
        {weekDates.map((date, index) => {
          const isToday = date.toDateString() === new Date().toDateString()
          const dayEvents = getEventsForDate(date)
          
          return (
            <Box
              key={index}
              sx={{
                flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(33.333% - 11px)', lg: 1 },
                minWidth: { lg: 0 },
              }}
            >
              <Card 
                sx={{ 
                  height: '100%',
                  border: isToday ? 2 : 0,
                  borderColor: 'primary.main',
                }}
              >
                <CardContent>
                  <Stack spacing={1}>
                    {/* Day Header */}
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontWeight="600"
                      >
                        {date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                      </Typography>
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color={isToday ? 'primary.main' : 'text.primary'}
                      >
                        {date.getDate()}
                      </Typography>
                    </Box>

                    {/* Events */}
                    <Stack spacing={1} mt={2}>
                      {dayEvents.length > 0 ? (
                        dayEvents.map((event) => (
                          <Paper
                            key={event.id}
                            sx={{
                              p: 1.5,
                              borderLeft: `4px solid ${getPersonColor(event.person)}`,
                              cursor: 'pointer',
                              '&:hover': {
                                bgcolor: 'action.hover',
                              },
                            }}
                          >
                            <Typography variant="body2" fontWeight="600" gutterBottom>
                              {event.title}
                            </Typography>
                            <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" useFlexGap>
                              {event.startTime && (
                                <Chip
                                  label={`${formatTime(event.startTime)}${event.endTime ? ` - ${formatTime(event.endTime)}` : ''}`}
                                  size="small"
                                  sx={{ fontSize: '0.7rem', height: 20 }}
                                />
                              )}
                              <Chip
                                label={event.person}
                                size="small"
                                sx={{
                                  fontSize: '0.7rem',
                                  height: 20,
                                  bgcolor: getPersonColor(event.person),
                                  color: 'white',
                                }}
                              />
                            </Stack>
                          </Paper>
                        ))
                      ) : (
                        <Box textAlign="center" py={3}>
                          <Typography variant="body2" color="text.secondary">
                            No events
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          )
        })}
      </Stack>

      {/* Event Sidebar - Family Legend */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="600" gutterBottom>
            Family Members
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            {people.map((person) => (
              <Chip
                key={person.name}
                label={person.name}
                sx={{
                  bgcolor: person.color,
                  color: 'white',
                  fontWeight: 600,
                }}
              />
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* Add Event Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Event</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Event Title"
              fullWidth
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              autoFocus
            />
            <FormControl fullWidth>
              <InputLabel>Person</InputLabel>
              <Select
                value={newEvent.person}
                label="Person"
                onChange={(e) => setNewEvent({ ...newEvent, person: e.target.value })}
              >
                {people.map((person) => (
                  <MenuItem key={person.name} value={person.name}>{person.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={newEvent.date}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Start Time"
                type="time"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={newEvent.startTime}
                onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
              />
              <TextField
                label="End Time"
                type="time"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={newEvent.endTime}
                onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
              />
            </Stack>
            <TextField
              label="Description (optional)"
              fullWidth
              multiline
              rows={2}
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAddEvent}
            variant="contained"
            disabled={!newEvent.title.trim() || !newEvent.person || !newEvent.date}
          >
            Add Event
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
