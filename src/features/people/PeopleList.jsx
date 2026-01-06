import { useState, useEffect } from 'react'
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
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Chip,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Palette as PaletteIcon,
} from '@mui/icons-material'
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'

const COLOR_OPTIONS = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Orange', value: '#F59E0B' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Teal', value: '#14B8A6' },
]

export default function PeopleList() {
  const [people, setPeople] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [editingPerson, setEditingPerson] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    color: COLOR_OPTIONS[0].value,
  })

  // Fetch people from Firestore
  useEffect(() => {
    const q = query(collection(db, 'people'), orderBy('createdAt'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const peopleData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setPeople(peopleData)
    })
    return () => unsubscribe()
  }, [])

  const handleOpenDialog = (person = null) => {
    if (person) {
      setEditingPerson(person)
      setFormData({
        name: person.name,
        role: person.role || '',
        color: person.color,
      })
    } else {
      setEditingPerson(null)
      setFormData({
        name: '',
        role: '',
        color: COLOR_OPTIONS[0].value,
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setEditingPerson(null)
    setFormData({ name: '', role: '', color: COLOR_OPTIONS[0].value })
  }

  const handleSave = async () => {
    if (!formData.name.trim()) return

    try {
      if (editingPerson) {
        // Update existing person
        await updateDoc(doc(db, 'people', editingPerson.id), {
          ...formData,
          updatedAt: serverTimestamp(),
        })
      } else {
        // Add new person
        await addDoc(collection(db, 'people'), {
          ...formData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      }

      handleCloseDialog()
    } catch (error) {
      console.error('Error saving person:', error)
    }
  }

  const handleDelete = async (personId) => {
    if (!confirm('Are you sure you want to delete this family member?')) return

    try {
      await deleteDoc(doc(db, 'people', personId))
    } catch (error) {
      console.error('Error deleting person:', error)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h2" fontWeight="bold" gutterBottom>
            Family Members
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your household members and their color assignments
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="large"
          onClick={() => handleOpenDialog()}
        >
          Add Member
        </Button>
      </Stack>

      {/* People Grid */}
      <Stack spacing={2}>
        {people.map((person) => (
          <Card key={person.id}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: person.color,
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                  }}
                >
                  {person.name[0]}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight="600">
                    {person.name}
                  </Typography>
                  {person.role && (
                    <Typography variant="body2" color="text.secondary">
                      {person.role}
                    </Typography>
                  )}
                </Box>
                <Stack direction="row" spacing={1}>
                  <Chip
                    icon={<PaletteIcon />}
                    label="Color"
                    sx={{
                      bgcolor: person.color,
                      color: 'white',
                      fontWeight: 600,
                    }}
                    size="small"
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(person)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(person.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {people.length === 0 && (
        <Card>
          <CardContent>
            <Box textAlign="center" py={6}>
              <PersonIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No family members yet
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Add your first family member to get started
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Add Member
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingPerson ? 'Edit Family Member' : 'Add Family Member'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              autoFocus
              required
            />
            <TextField
              label="Role (optional)"
              fullWidth
              placeholder="e.g., Parent, Child, Pet"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            />
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Choose a color for calendar and task assignments
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {COLOR_OPTIONS.map((color) => (
                  <Box
                    key={color.value}
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: color.value,
                      cursor: 'pointer',
                      border: formData.color === color.value ? '3px solid' : '2px solid transparent',
                      borderColor: formData.color === color.value ? 'primary.main' : 'transparent',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'scale(1.1)',
                      },
                    }}
                  />
                ))}
              </Stack>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2">Preview:</Typography>
              <Chip
                avatar={
                  <Avatar sx={{ bgcolor: formData.color }}>
                    {formData.name[0] || '?'}
                  </Avatar>
                }
                label={formData.name || 'Name'}
                sx={{ fontWeight: 600 }}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!formData.name.trim()}
          >
            {editingPerson ? 'Save Changes' : 'Add Member'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
