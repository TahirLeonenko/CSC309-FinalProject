import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Notification, LoadingOverlay, Button, Title, TextInput, Group, Paper, SimpleGrid } from '@mantine/core';
import './styles.css';

function EventUserManagement() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [eventId, setEventId] = useState(id || '');
  const [eventData, setEventData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [addGuestForm, setAddGuestForm] = useState({ utorid: '' });

  // Load event data when component mounts or URL changes
  useEffect(() => {
    if (id) {
      setEventId(id);
      handleSearch(id);
    }
  }, [id]);

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
      navigate(`/event-organizer/user-management/${searchId}`, { replace: true });
    } catch (err) {
      setError(err.message);
      setEventData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGuest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`http://localhost:3000/events/${eventId}/guests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ utorid: addGuestForm.utorid }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Error ${res.status}: ${errorData.error || 'Failed to add guest'}`);
      }

      // Fetch the updated event data to get the complete guest information
      const updatedEventRes = await fetch(`http://localhost:3000/events/${eventId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!updatedEventRes.ok) {
        throw new Error('Failed to fetch updated event data');
      }

      const updatedEventData = await updatedEventRes.json();
      setEventData(updatedEventData);
      setAddGuestForm({ utorid: '' });
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
      <Title order={1} mb="md">Event User Management</Title>
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
          <Paper shadow="xs" p="md" mb="lg">
            <Title order={3} mb="md">Event Details</Title>
            <div className="event-user-grid-table-container">
              <div className="event-user-grid-table event-details">
                <div className="event-user-grid-row header">
                  <div className="event-user-grid-cell">ID</div>
                  <div className="event-user-grid-cell">Name</div>
                  <div className="event-user-grid-cell">Description</div>
                  <div className="event-user-grid-cell">Location</div>
                  <div className="event-user-grid-cell">Start Time</div>
                  <div className="event-user-grid-cell">End Time</div>
                  <div className="event-user-grid-cell">Capacity</div>
                  <div className="event-user-grid-cell">Points Remaining</div>
                  <div className="event-user-grid-cell">Points Awarded</div>
                  <div className="event-user-grid-cell">Published</div>
                  <div className="event-user-grid-cell">Organizers</div>
                </div>
                <div className="event-user-grid-row">
                  <div className="event-user-grid-cell">{eventData.id}</div>
                  <div className="event-user-grid-cell">{eventData.name}</div>
                  <div className="event-user-grid-cell">{eventData.description}</div>
                  <div className="event-user-grid-cell">{eventData.location}</div>
                  <div className="event-user-grid-cell">{new Date(eventData.startTime).toLocaleString()}</div>
                  <div className="event-user-grid-cell">{new Date(eventData.endTime).toLocaleString()}</div>
                  <div className="event-user-grid-cell">{eventData.capacity}</div>
                  <div className="event-user-grid-cell">{eventData.pointsRemain}</div>
                  <div className="event-user-grid-cell">{eventData.pointsAwarded}</div>
                  <div className="event-user-grid-cell">{eventData.published ? 'Yes' : 'No'}</div>
                  <div className="event-user-grid-cell">{eventData.organizers.map(org => org.utorid).join(', ')}</div>
                </div>
              </div>
            </div>
          </Paper>

          <Paper shadow="xs" p="md">
            <Title order={3} mb="md">Guests</Title>
            <div className="event-user-grid-table-container">
              <div className="event-user-grid-table guests">
                <div className="event-user-grid-row header">
                  <div className="event-user-grid-cell">UTORID</div>
                  <div className="event-user-grid-cell">Name</div>
                </div>
                {eventData.guests.map((guest) => (
                  <div key={guest.id} className="event-user-grid-row">
                    <div className="event-user-grid-cell">{guest.utorid}</div>
                    <div className="event-user-grid-cell">{guest.name}</div>
                  </div>
                ))}
              </div>
            </div>

            <Title order={4} mt="lg" mb="md">Add Guest</Title>
            <form onSubmit={handleAddGuest}>
              <Group>
                <TextInput
                  placeholder="Enter UTORID"
                  value={addGuestForm.utorid}
                  onChange={(e) => setAddGuestForm({ utorid: e.currentTarget.value })}
                  style={{ width: '300px' }}
                />
                <Button type="submit" loading={loading}>
                  Add Guest
                </Button>
              </Group>
            </form>
          </Paper>
        </>
      )}
    </Container>
  );
}

export default EventUserManagement;
