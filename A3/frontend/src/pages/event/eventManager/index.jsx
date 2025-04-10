import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Notification, LoadingOverlay, Button, Title, TextInput, Group, Paper, SimpleGrid, NumberInput, Switch } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import './styles.css';

function EventManager() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [eventId, setEventId] = useState(id || '');
  const [eventData, setEventData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    name: '',
    description: '',
    location: '',
    startTime: '',
    endTime: '',
  });

  // Load event data when component mounts or URL changes
  useEffect(() => {
    if (id) {
      setEventId(id);
      handleSearch(id);
    }
  }, [id]);

  useEffect(() => {
    if (eventData) {
      setUpdateForm({
        name: eventData.name || '',
        description: eventData.description || '',
        location: eventData.location || '',
        startTime: eventData.startTime || '',
        endTime: eventData.endTime || '',
      });
    }
  }, [eventData]);

  const handleSearch = async (searchId = eventId) => {
    if (!searchId) {
      setError('Please enter an Event ID');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3000/events/${searchId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch event data');
      }

      const data = await res.json();
      
      // Check if current user is an organizer
      const currentUserUtorid = localStorage.getItem('utorid');
      const isOrganizer = data.organizers.some(org => org.utorid === currentUserUtorid);
      
      if (!isOrganizer) {
        throw new Error('You are not authorized to manage this event');
      }

      setEventData(data);
      setError('');
      // Update the URL path
      navigate(`/event-organizer/events/${searchId}`, { replace: true });
    } catch (err) {
      setError(err.message);
      setEventData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`http://localhost:3000/events/${eventData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          name: updateForm.name,
          description: updateForm.description,
          location: updateForm.location,
          startTime: updateForm.startTime,
          endTime: updateForm.endTime,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Error ${res.status}: ${errorData.error || 'Failed to update event'}`);
      }

      const updatedData = await res.json();
      setEventData(prev => ({ ...prev, ...updatedData }));
      setUpdateForm(prev => ({ ...prev, ...updatedData }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingOverlay visible={loading} />
      </Container>
    );
  }

  return (
    <Container>
      <Title order={1} mb="md">Event Search</Title>
      <Group mb="md">
        <TextInput
          placeholder="Enter Event ID"
          value={eventId}
          onChange={(e) => setEventId(e.currentTarget.value)}
          style={{ width: '300px' }}
        />
        <Button onClick={() => handleSearch()}>Search</Button>
      </Group>

      {error && !eventData && (
        <Notification color="red" title="Error" onClose={() => setError('')}>
          {error}
        </Notification>
      )}

      {error && eventData && (
        <Notification color="red" title="Error" onClose={() => setError('')} mb="md">
          {error}
        </Notification>
      )}

      {eventData && (
        <>
          <div className="event-manager-grid-table-container">
            <div className="event-manager-grid-table">
              {/* Header Row */}
              <div className="event-manager-grid-row header">
                <div className="event-manager-grid-cell">ID</div>
                <div className="event-manager-grid-cell">Name</div>
                <div className="event-manager-grid-cell">Description</div>
                <div className="event-manager-grid-cell">Location</div>
                <div className="event-manager-grid-cell">Start Time</div>
                <div className="event-manager-grid-cell">End Time</div>
                <div className="event-manager-grid-cell">Capacity</div>
                <div className="event-manager-grid-cell">Points Remaining</div>
                <div className="event-manager-grid-cell">Points Awarded</div>
                <div className="event-manager-grid-cell">Published</div>
                <div className="event-manager-grid-cell">Organizers</div>
                <div className="event-manager-grid-cell">Guests</div>
              </div>
              {/* Data Row */}
              <div className="event-manager-grid-row">
                <div className="event-manager-grid-cell">{eventData.id}</div>
                <div className="event-manager-grid-cell">{eventData.name}</div>
                <div className="event-manager-grid-cell">{eventData.description}</div>
                <div className="event-manager-grid-cell">{eventData.location}</div>
                <div className="event-manager-grid-cell">{new Date(eventData.startTime).toLocaleString()}</div>
                <div className="event-manager-grid-cell">{new Date(eventData.endTime).toLocaleString()}</div>
                <div className="event-manager-grid-cell">{eventData.capacity}</div>
                <div className="event-manager-grid-cell">{eventData.pointsRemain}</div>
                <div className="event-manager-grid-cell">{eventData.pointsAwarded}</div>
                <div className="event-manager-grid-cell">{eventData.published ? 'Yes' : 'No'}</div>
                <div className="event-manager-grid-cell">{eventData.organizers.map(org => org.utorid).join(', ')}</div>
                <div className="event-manager-grid-cell">{eventData.guests.map(guest => guest.utorid).join(', ')}</div>
              </div>
            </div>
          </div>

          <Paper shadow="xs" p="md" mt="lg">
            <Title order={3} mb="md">Update Event</Title>
            <form onSubmit={handleUpdateEvent}>
              <SimpleGrid cols={2} spacing="md">
                <TextInput
                  label="Name"
                  value={updateForm.name}
                  onChange={(e) => setUpdateForm({ ...updateForm, name: e.currentTarget.value })}
                  placeholder="Event name"
                />
                <TextInput
                  label="Location"
                  value={updateForm.location}
                  onChange={(e) => setUpdateForm({ ...updateForm, location: e.currentTarget.value })}
                  placeholder="Event location"
                />
                <TextInput
                  label="Description"
                  value={updateForm.description}
                  onChange={(e) => setUpdateForm({ ...updateForm, description: e.currentTarget.value })}
                  placeholder="Event description"
                />
                <DateTimePicker
                  label="Start Time"
                  value={updateForm.startTime ? new Date(updateForm.startTime) : null}
                  onChange={(date) => setUpdateForm({ ...updateForm, startTime: date?.toISOString() })}
                  placeholder="Pick start date and time"
                />
                <DateTimePicker
                  label="End Time"
                  value={updateForm.endTime ? new Date(updateForm.endTime) : null}
                  onChange={(date) => setUpdateForm({ ...updateForm, endTime: date?.toISOString() })}
                  placeholder="Pick end date and time"
                />
              </SimpleGrid>
              <Group position="right" mt="md">
                <Button type="submit" loading={loading}>
                  Update Event
                </Button>
              </Group>
            </form>
          </Paper>
        </>
      )}
    </Container>
  );
}

export default EventManager;
