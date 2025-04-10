import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Notification, LoadingOverlay, Button, Title, TextInput, Group, Paper, SimpleGrid, NumberInput, Select } from '@mantine/core';
import './styles.css';

function EventTransactions() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [eventId, setEventId] = useState(id || '');
  const [eventData, setEventData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [transactionForm, setTransactionForm] = useState({
    type: 'event',
    utorid: '',
    amount: '',
  });

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
      navigate(`/event-organizer/transactions/${searchId}`, { replace: true });
    } catch (err) {
      setError(err.message);
      setEventData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const res = await fetch(`http://localhost:3000/events/${eventId}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          type: transactionForm.type,
          utorid: transactionForm.utorid || undefined,
          amount: Number(transactionForm.amount),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Error ${res.status}: ${errorData.error || 'Failed to create transaction'}`);
      }

      setSuccessMessage('Transaction created');
      setTransactionForm({
        type: 'event',
        utorid: '',
        amount: '',
      });
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
      <Title order={1} mb="md">Event Transactions</Title>
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

      {successMessage && (
        <Notification color="green" title="Success" onClose={() => setSuccessMessage('')} mb="md">
          {successMessage}
        </Notification>
      )}

      {eventData && (
        <>
          <Paper shadow="xs" p="md" mb="lg">
            <Title order={3} mb="md">Event Details</Title>
            <div className="event-transactions-grid-table-container">
              <div className="event-transactions-grid-table event-details">
                <div className="event-transactions-grid-row header">
                  <div className="event-transactions-grid-cell">ID</div>
                  <div className="event-transactions-grid-cell">Name</div>
                  <div className="event-transactions-grid-cell">Description</div>
                  <div className="event-transactions-grid-cell">Location</div>
                  <div className="event-transactions-grid-cell">Start Time</div>
                  <div className="event-transactions-grid-cell">End Time</div>
                  <div className="event-transactions-grid-cell">Capacity</div>
                  <div className="event-transactions-grid-cell">Points Remaining</div>
                  <div className="event-transactions-grid-cell">Points Awarded</div>
                  <div className="event-transactions-grid-cell">Published</div>
                  <div className="event-transactions-grid-cell">Organizers</div>
                </div>
                <div className="event-transactions-grid-row">
                  <div className="event-transactions-grid-cell">{eventData.id}</div>
                  <div className="event-transactions-grid-cell">{eventData.name}</div>
                  <div className="event-transactions-grid-cell">{eventData.description}</div>
                  <div className="event-transactions-grid-cell">{eventData.location}</div>
                  <div className="event-transactions-grid-cell">{new Date(eventData.startTime).toLocaleString()}</div>
                  <div className="event-transactions-grid-cell">{new Date(eventData.endTime).toLocaleString()}</div>
                  <div className="event-transactions-grid-cell">{eventData.capacity}</div>
                  <div className="event-transactions-grid-cell">{eventData.pointsRemain}</div>
                  <div className="event-transactions-grid-cell">{eventData.pointsAwarded}</div>
                  <div className="event-transactions-grid-cell">{eventData.published ? 'Yes' : 'No'}</div>
                  <div className="event-transactions-grid-cell">{eventData.organizers.map(org => org.utorid).join(', ')}</div>
                </div>
              </div>
            </div>
          </Paper>

          <Paper shadow="xs" p="md">
            <Title order={3} mb="md">Create Transaction</Title>
            <form onSubmit={handleCreateTransaction}>
              <SimpleGrid cols={2} spacing="md">
                <TextInput
                  label="Type"
                  value="event"
                  disabled
                />
                <TextInput
                  label="UTORID"
                  placeholder="Enter UTORID (optional)"
                  value={transactionForm.utorid}
                  onChange={(e) => setTransactionForm({ ...transactionForm, utorid: e.currentTarget.value })}
                />
                <NumberInput
                  label="Amount"
                  placeholder="Enter amount"
                  value={transactionForm.amount}
                  onChange={(value) => setTransactionForm({ ...transactionForm, amount: value })}
                  min={0}
                  required
                />
              </SimpleGrid>
              <Group position="right" mt="md">
                <Button type="submit" loading={loading}>
                  Create Transaction
                </Button>
              </Group>
            </form>
          </Paper>
        </>
      )}
    </Container>
  );
}

export default EventTransactions; 