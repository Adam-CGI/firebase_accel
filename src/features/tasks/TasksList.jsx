import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Checkbox,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ToggleButtonGroup,
  ToggleButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material'
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../auth/AuthContext'

export default function TasksList() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [rooms, setRooms] = useState([])
  const [people, setPeople] = useState([])
  const [filterRoom, setFilterRoom] = useState('all')
  const [filterAssignee, setFilterAssignee] = useState('all')
  const [filterStatus, setFilterStatus] = useState('active')
  const [openDialog, setOpenDialog] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignee: '',
    room: '',
    recurring: 'none',
    recurringDays: [],
    dueDate: '',
  })

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  // Fetch rooms from Firestore
  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'rooms'), orderBy('createdAt'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomsData = snapshot.docs
        .filter(doc => !doc.data().isArchived)
        .map(doc => doc.data().name)
      setRooms(roomsData)
    })
    return () => unsubscribe()
  }, [user])

  // Fetch people from Firestore
  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'people'), orderBy('createdAt'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const peopleData = snapshot.docs.map(doc => doc.data().name)
      setPeople(peopleData)
    })
    return () => unsubscribe()
  }, [user])

  // Fetch tasks from Firestore
  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setTasks(tasksData)
    })
    return () => unsubscribe()
  }, [user])

  const handleAddTask = async () => {
    if (!newTask.title.trim()) return

    try {
      await addDoc(collection(db, 'tasks'), {
        ...newTask,
        completed: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      
      setOpenDialog(false)
      setNewTask({
        title: '',
        description: '',
        assignee: '',
        room: '',
        recurring: 'none',
        recurringDays: [],
        dueDate: '',
      })
    } catch (error) {
      console.error('Error adding task:', error)
    }
  }

  const handleToggleTask = async (taskId, completed) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        completed: !completed,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId))
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const filteredTasks = tasks.filter((task) => {
    if (filterRoom !== 'all' && task.room !== filterRoom) return false
    if (filterAssignee !== 'all' && task.assignee !== filterAssignee) return false
    if (filterStatus === 'active' && task.completed) return false
    if (filterStatus === 'completed' && !task.completed) return false
    return true
  })

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h2" fontWeight="bold" gutterBottom>
            Tasks & Chores
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage household tasks and assignments
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="large"
          onClick={() => setOpenDialog(true)}
        >
          Add Task
        </Button>
      </Stack>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems="stretch"
          >
            <Box sx={{ flex: 1 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Room</InputLabel>
                <Select
                  value={filterRoom}
                  label="Room"
                  onChange={(e) => setFilterRoom(e.target.value)}
                >
                  <MenuItem value="all">All Rooms</MenuItem>
                  {rooms.map((room) => (
                    <MenuItem key={room} value={room}>{room}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: 1 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Assignee</InputLabel>
                <Select
                  value={filterAssignee}
                  label="Assignee"
                  onChange={(e) => setFilterAssignee(e.target.value)}
                >
                  <MenuItem value="all">All People</MenuItem>
                  {people.map((person) => (
                    <MenuItem key={person} value={person}>{person}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: 1 }}>
              <ToggleButtonGroup
                value={filterStatus}
                exclusive
                onChange={(e, value) => value && setFilterStatus(value)}
                fullWidth
                size="small"
              >
                <ToggleButton value="all">All</ToggleButton>
                <ToggleButton value="active">Active</ToggleButton>
                <ToggleButton value="completed">Done</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" fontWeight="600">
              {filterStatus === 'completed' ? 'Completed Tasks' : 'Active Tasks'}
            </Typography>
            <Chip 
              label={`${filteredTasks.length} tasks`} 
              color="primary" 
              size="small" 
            />
          </Stack>
          <List>
            {filteredTasks.map((task, index) => (
              <Box key={task.id}>
                <ListItem
                  secondaryAction={
                    <Stack direction="row" spacing={1}>
                      <IconButton edge="end" size="small" onClick={() => handleDeleteTask(task.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  }
                  disablePadding
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={task.completed}
                      onChange={() => handleToggleTask(task.id, task.completed)}
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography
                          variant="body1"
                          sx={{
                            textDecoration: task.completed ? 'line-through' : 'none',
                            color: task.completed ? 'text.secondary' : 'text.primary',
                          }}
                        >
                          {task.title}
                        </Typography>
                        {task.recurring !== 'none' && (
                          <Chip
                            label={task.recurringDays?.join(', ') || 'Recurring'}
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        )}
                      </Stack>
                    }
                    secondary={
                      <Stack direction="row" spacing={1} mt={0.5} flexWrap="wrap" useFlexGap>
                        {task.assignee && (
                          <Chip
                            avatar={<Avatar sx={{ width: 20, height: 20 }}>{task.assignee[0]}</Avatar>}
                            label={task.assignee}
                            size="small"
                            variant="outlined"
                          />
                        )}
                        {task.room && (
                          <Chip
                            icon={<HomeIcon fontSize="small" />}
                            label={task.room}
                            size="small"
                            variant="outlined"
                          />
                        )}
                        {task.dueDate && (
                          <Chip
                            icon={<CalendarIcon fontSize="small" />}
                            label={new Date(task.dueDate).toLocaleDateString()}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Stack>
                    }
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                </ListItem>
                {index < filteredTasks.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
          {filteredTasks.length === 0 && (
            <Box textAlign="center" py={6}>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                No tasks found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your filters or add a new task
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Add Task Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Task</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Task Title"
              fullWidth
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              autoFocus
            />
            <TextField
              label="Description (optional)"
              fullWidth
              multiline
              rows={2}
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Assign To</InputLabel>
              <Select
                value={newTask.assignee}
                label="Assign To"
                onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
              >
                {people.map((person) => (
                  <MenuItem key={person} value={person}>{person}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Room</InputLabel>
              <Select
                value={newTask.room}
                label="Room"
                onChange={(e) => setNewTask({ ...newTask, room: e.target.value })}
              >
                {rooms.map((room) => (
                  <MenuItem key={room} value={room}>{room}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Due Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
            />
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Recurring
              </Typography>
              <ToggleButtonGroup
                value={newTask.recurringDays}
                onChange={(e, value) => setNewTask({ ...newTask, recurringDays: value, recurring: value.length > 0 ? 'weekly' : 'none' })}
                sx={{ flexWrap: 'wrap' }}
                size="small"
              >
                {daysOfWeek.map((day) => (
                  <ToggleButton key={day} value={day}>
                    {day}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddTask} variant="contained" disabled={!newTask.title.trim()}>
            Add Task
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
