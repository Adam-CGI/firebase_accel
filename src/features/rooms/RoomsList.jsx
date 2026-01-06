import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  IconButton,
  Stack,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Paper,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Archive as ArchiveIcon,
  Home as HomeIcon,
} from '@mui/icons-material'
import { db } from '../../firebase.js'
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  doc,
} from 'firebase/firestore'
import { useAuth } from '../auth/AuthContext'

function CreateRoomForm({ onCreated }) {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      const roomsCol = collection(db, 'rooms')
      await addDoc(roomsCol, {
        name: name.trim(),
        sortOrder: Date.now(),
        isArchived: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      setName('')
      onCreated?.()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <form onSubmit={handleCreate}>
        <Stack direction="row" spacing={2}>
          <TextField
            fullWidth
            size="small"
            placeholder="Room name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={saving}
          />
          <Button
            type="submit"
            variant="contained"
            startIcon={<AddIcon />}
            disabled={saving || !name.trim()}
          >
            {saving ? 'Creating…' : 'Create'}
          </Button>
        </Stack>
      </form>
    </Paper>
  )
}

function RoomRow({ room }) {
  const [renaming, setRenaming] = useState(false)
  const [newName, setNewName] = useState(room.name)

  const saveRename = async () => {
    if (!newName.trim()) return
    const ref = doc(db, 'rooms', room.id)
    await updateDoc(ref, { name: newName.trim(), updatedAt: serverTimestamp() })
    setRenaming(false)
  }

  const archive = async () => {
    const ref = doc(db, 'rooms', room.id)
    await updateDoc(ref, { isArchived: true, updatedAt: serverTimestamp() })
  }

  return (
    <ListItem
      secondaryAction={
        !renaming ? (
          <Stack direction="row" spacing={1}>
            <IconButton edge="end" size="small" onClick={() => setRenaming(true)}>
              <EditIcon />
            </IconButton>
            {!room.isArchived && (
              <IconButton edge="end" size="small" onClick={archive}>
                <ArchiveIcon />
              </IconButton>
            )}
          </Stack>
        ) : (
          <Stack direction="row" spacing={1}>
            <IconButton edge="end" size="small" color="primary" onClick={saveRename}>
              <CheckIcon />
            </IconButton>
            <IconButton edge="end" size="small" onClick={() => { setRenaming(false); setNewName(room.name); }}>
              <CloseIcon />
            </IconButton>
          </Stack>
        )
      }
    >
      <ListItemText
        primary={
          renaming ? (
            <TextField
              fullWidth
              size="small"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveRename()
                if (e.key === 'Escape') { setRenaming(false); setNewName(room.name); }
              }}
              autoFocus
            />
          ) : (
            <Stack direction="row" spacing={1} alignItems="center">
              <HomeIcon fontSize="small" color="action" />
              <Typography variant="body1">{room.name}</Typography>
              {room.isArchived && <Chip label="Archived" size="small" />}
            </Stack>
          )
        }
      />
    </ListItem>
  )
}

export default function RoomsList() {
  const { user } = useAuth()
  const [rooms, setRooms] = useState([])

  useEffect(() => {
    if (!user) return
    const roomsCol = collection(db, 'rooms')
    const q = query(roomsCol, orderBy('createdAt'))
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      setRooms(list)
    })
    return () => unsub()
  }, [user])

  const activeRooms = useMemo(() => rooms.filter((r) => !r.isArchived), [rooms])
  const archivedRooms = useMemo(() => rooms.filter((r) => r.isArchived), [rooms])

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h2" fontWeight="bold" gutterBottom>
          Rooms
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage rooms and spaces in your household
        </Typography>
      </Box>

      <CreateRoomForm />

      <Card>
        <CardContent>
          <Typography variant="h5" fontWeight="600" gutterBottom>
            Active Rooms
          </Typography>
          {activeRooms.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="body2" color="text.secondary">
                No active rooms yet. Create one above!
              </Typography>
            </Box>
          ) : (
            <List>
              {activeRooms.map((room, index) => (
                <Box key={room.id}>
                  <RoomRow room={room} />
                  {index < activeRooms.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {archivedRooms.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h5" fontWeight="600" gutterBottom>
              Archived Rooms
            </Typography>
            <List>
              {archivedRooms.map((room, index) => (
                <Box key={room.id}>
                  <RoomRow room={room} />
                  {index < archivedRooms.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </Container>
  )
}
