import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Snackbar,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Input,
  OutlinedInput
} from '@mui/material';
import { styled } from '@mui/material/styles';
import Navigator from '../../Navigation/Navigator';
import Footer from '../../components/Footer/Footer';
import { Add as AddIcon, Search as SearchIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const api_server = process.env.REACT_APP_API_SERVER;

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: '8px',
  backgroundColor: '#fff',
  boxShadow: 'none'
}));

const StyledCard = styled(Card)({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
});

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

// Add predefined activity options
const ECO_ACTIVITIES = [
  "Tree planting",
  "Beach cleanup"
];

const Event = () => {
  const [userId, setUserId] = useState(null);
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [newEvent, setNewEvent] = useState({
    user_id: '',
    event_name: '',
    description: '',
    event_time: '',
    event_location: '',
    carbon_offset_estimation: '',
    eco_activities: [],
    xp_rewards: '',
    event_image: null,
    imagePreview: ''
  });

  // Add error states
  const [errors, setErrors] = useState({
    event_name: false,
    event_time: false,
    event_location: false,
    xp_rewards: false
  });

  const navigate = useNavigate();

  // Fetch the event list
  const fetchEvents = async () => {
    try {
      const response = await fetch(`${api_server}/events`);
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      showSnackbar('Failed to load events', 'error');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewEvent({
          ...newEvent,
          event_image: file,
          imagePreview: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {
      event_name: !newEvent.event_name.trim(),
      event_time: !newEvent.event_time,
      event_location: !newEvent.event_location.trim(),
      xp_rewards: !newEvent.xp_rewards || newEvent.xp_rewards <= 0
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  // Modify function to check login status
  const checkLoginAndProceed = async (action) => {
    try {
      const response = await fetch(`${api_server}/auth`, {
        credentials: "include",
      });
      
      if (response.status === 401) {
        navigate("/login");
        return;
      }
      
      const userInfo = await response.json();
      setUserId(userInfo.id);
      // Wait for userId to be set before executing the action
      await action(userInfo.id);
      return true;
    } catch (error) {
      console.error('Error checking auth:', error);
      return false;
    }
  };

  // Modify button click handler
  <Button
    variant="contained"
    startIcon={<AddIcon />}
    onClick={() => checkLoginAndProceed(() => setOpenDialog(true))}
    sx={{
      bgcolor: '#3c8c6c',
      '&:hover': { bgcolor: '#2b6b4f' }
    }}
  >
    Create Event
  </Button>

  // Modify function to handle event creation
  const handleCreateEvent = async () => {
    if (!validateForm()) {
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('event_name', newEvent.event_name);
      formData.append('description', newEvent.description);
      formData.append('event_time', newEvent.event_time);
      formData.append('event_location', newEvent.event_location);
      formData.append('carbon_offset_estimation', newEvent.carbon_offset_estimation);
      formData.append('eco_activities', JSON.stringify(newEvent.eco_activities));
      formData.append('xp_rewards', newEvent.xp_rewards);
      
      if (newEvent.event_image) {
        formData.append('image', newEvent.event_image);
      }

      const response = await fetch(`${api_server}/events`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create event');
      }

      const data = await response.json();
      showSnackbar(data.message || 'Event created successfully!', 'success');
      setOpenDialog(false);
      fetchEvents();
      resetForm();
    } catch (error) {
      console.error('Error creating event:', error);
      showSnackbar(error.message || 'Failed to create event', 'error');
    }
  };

  // Modify reset form function
  const resetForm = () => {
    setNewEvent({
      user_id: '',
      event_name: '',
      description: '',
      event_time: '',
      event_location: '',
      carbon_offset_estimation: '',
      eco_activities: [],
      xp_rewards: '',
      event_image: null,
      imagePreview: ''
    });
    setErrors({
      event_name: false,
      event_time: false,
      event_location: false,
      xp_rewards: false
    });
  };

  // Modify function to join an event
  const handleJoinEvent = async (eventId) => {
    checkLoginAndProceed(async (userId) => {  // Receive userId parameter
      try {
        const response = await fetch(`${api_server}/events/${eventId}/join`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            event_id: eventId,
            user_id: userId  // Use the provided userId
          }),
          credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to join event');

        showSnackbar('Successfully joined the event!', 'success');
        fetchEvents();
      } catch (error) {
        console.error('Error joining event:', error);
        showSnackbar('Failed to join event', 'error');
      }
    });
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  // Handle activity selection
  const handleActivityChange = (event) => {
    const {
      target: { value },
    } = event;
    setNewEvent({
      ...newEvent,
      eco_activities: typeof value === 'string' ? value.split(',') : value,
    });
  };

  // Modify search logic
  const filteredEvents = events.filter(event => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      (event.event_name && event.event_name.toLowerCase().includes(searchTermLower)) ||
      (event.description && event.description.toLowerCase().includes(searchTermLower)) ||
      (event.event_location && event.event_location.toLowerCase().includes(searchTermLower))
    );
  });

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navigator />
      <Container sx={{ flex: 1, mt: 3 }}>
        <StyledPaper elevation={0}>
          {/* Search and Create Button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3, gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <TextField
                size="small"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    // Trigger search
                    const filtered = events.filter(event => {
                      const searchTermLower = searchTerm.toLowerCase();
                      return (
                        (event.event_name && event.event_name.toLowerCase().includes(searchTermLower)) ||
                        (event.description && event.description.toLowerCase().includes(searchTermLower)) ||
                        (event.event_location && event.event_location.toLowerCase().includes(searchTermLower))
                      );
                    });
                    // Update displayed results
                    setEvents(filtered);
                  }
                }}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                }}
                sx={{ width: 400 }}
              />
            </Box>
            <Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => checkLoginAndProceed(() => setOpenDialog(true))}
                sx={{
                  bgcolor: '#3c8c6c',
                  '&:hover': { bgcolor: '#2b6b4f' }
                }}
              >
                Create Event
              </Button>
            </Box>
          </Box>

          {/* Event List */}
          <Grid container spacing={3}>
            {filteredEvents.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <StyledCard>
                  <CardMedia
                    component="img"
                    height="160"
                    image={event.event_image || '/default-event.jpg'}
                    alt={event.event_name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6">
                      {event.event_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {event.description}
                    </Typography>
                    <Box sx={{ mb: 1 }}>
                      {event.eco_activities.map((activity, index) => (
                        <Chip
                          key={index}
                          label={activity}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                    <Typography variant="body2">
                      📍 {event.event_location}
                    </Typography>
                    <Typography variant="body2">
                      📅 {new Date(event.event_time).toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      ♻️ Carbon Offset: {event.carbon_offset_estimation}kg CO₂
                    </Typography>
                    <Typography variant="body2">
                      🎮 XP Rewards: +{event.xp_rewards} XP
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleJoinEvent(event._id)}
                      sx={{
                        bgcolor: '#3c8c6c',
                        '&:hover': { bgcolor: '#2b6b4f' }
                      }}
                    >
                      Join Event
                    </Button>
                  </CardActions>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
        </StyledPaper>
      </Container>
      <Footer />

      {/* Create Event Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Event</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Event Name"
              value={newEvent.event_name}
              onChange={(e) => setNewEvent({ ...newEvent, event_name: e.target.value })}
              required
              error={errors.event_name}
              helperText={errors.event_name ? 'Event name is required' : ''}
            />
            <TextField
              label="Description"
              multiline
              rows={4}
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              required
            />
            <TextField
              label="Date & Time"
              type="datetime-local"
              value={newEvent.event_time}
              onChange={(e) => setNewEvent({ ...newEvent, event_time: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
              error={errors.event_time}
              helperText={errors.event_time ? 'Date & Time is required' : ''}
            />
            <TextField
              label="Location"
              value={newEvent.event_location}
              onChange={(e) => setNewEvent({ ...newEvent, event_location: e.target.value })}
              required
              error={errors.event_location}
              helperText={errors.event_location ? 'Location is required' : ''}
            />
            <TextField
              label="Carbon Offset Estimation (kg CO₂)"
              type="number"
              value={newEvent.carbon_offset_estimation}
              onChange={(e) => setNewEvent({ ...newEvent, carbon_offset_estimation: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel id="eco-activities-label">Eco Activities</InputLabel>
              <Select
                labelId="eco-activities-label"
                multiple
                value={newEvent.eco_activities}
                onChange={handleActivityChange}
                input={<OutlinedInput label="Eco Activities" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {ECO_ACTIVITIES.map((activity) => (
                  <MenuItem key={activity} value={activity}>
                    {activity}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="XP Rewards"
              type="number"
              value={newEvent.xp_rewards}
              onChange={(e) => setNewEvent({ ...newEvent, xp_rewards: e.target.value })}
              required
              error={errors.xp_rewards}
              helperText={errors.xp_rewards ? 'XP Rewards must be greater than 0' : ''}
            />
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
            >
              Upload Event Image
              <VisuallyHiddenInput
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </Button>
            {newEvent.imagePreview && (
              <Box sx={{ mt: 2 }}>
                <img
                  src={newEvent.imagePreview}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: '200px' }}
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenDialog(false);
            resetForm();
          }}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateEvent}
            variant="contained"
            sx={{ bgcolor: '#3c8c6c' }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Message */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Event;
