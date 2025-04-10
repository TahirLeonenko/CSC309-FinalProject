import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';

import {
  Box,
  TextInput,
  Button,
  Paper,
  Title,
  Notification,
  LoadingOverlay,
  Group,
  Container,
  SimpleGrid,
  NumberInput,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';

function CreateEventPage() {
  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [capacity, setCapacity] = useState('');
  const [points, setPoints] = useState('');

  const handleCreateEvent = async () => {
    if (!name || !description || !location || !startTime || !endTime || points === '') {
      setError('All required fields (name, description, location, start time, end time, points) must be filled.');
      return;
    }

    if (startTime >= endTime) {
      setError('End time must be after start time.');
      return;
    }

    if (capacity !== '' && (isNaN(Number(capacity)) || Number(capacity) <= 0)) {
      setError('Capacity must be a positive number or left blank.');
      return;
    }

    if (isNaN(Number(points)) || Number(points) <= 0 || !Number.isInteger(Number(points))) {
      setError('Points must be a positive integer.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const body = {
        name,
        description,
        location,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        points: Number(points),
      };

      if (capacity !== '') {
        body.capacity = Number(capacity);
      }

      const res = await fetch('http://localhost:3000/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        switch (res.status) {
          case 400:
            throw new Error(`Invalid request: ${errorData.error}`);
          case 401:
            localStorage.removeItem('access_token');
            navigate('/login?returnTo=/manager/events/create', { replace: true });
            throw new Error('Your session has expired. Please log in again.');
          case 403:
            throw new Error('You do not have permission to create events.');
          default:
            throw new Error(errorData.error || 'Failed to create event');
        }
      }

      const event = await res.json();
      alert('Event created successfully!');
      navigate(`/manager/events`); // Redirect to events list after success
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container my="md">
      <h1>Create Event</h1>

      {error && (
        <Notification color="red" mb="md" onClose={() => setError('')}>
          {error}
        </Notification>
      )}

      <SimpleGrid cols={1} spacing="lg" breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
        <Paper shadow="xs" p="md" mb="lg" style={{ position: 'relative' }}>
          <LoadingOverlay visible={loading} />
          <Box mt="md">
            <Title order={4} mb="sm">
              Event Details
            </Title>
            <TextInput
              label="Name"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              mb="sm"
              className="form-field-medium"
              required
            />
            <TextInput
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.currentTarget.value)}
              mb="sm"
              className="form-field-medium"
              required
            />
            <TextInput
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.currentTarget.value)}
              mb="sm"
              className="form-field-medium"
              required
            />
            <DateTimePicker
              label="Start Time"
              placeholder="Pick start date and time"
              value={startTime}
              onChange={setStartTime}
              mb="sm"
              className="form-field-medium"
              required
            />
            <DateTimePicker
              label="End Time"
              placeholder="Pick end date and time"
              value={endTime}
              onChange={setEndTime}
              mb="sm"
              className="form-field-medium"
              required
            />
            <NumberInput
              label="Capacity (optional)"
              value={capacity}
              onChange={setCapacity}
              mb="sm"
              className="form-field-medium"
              min={1}
              allowDecimal={false}
            />
            <NumberInput
              label="Points"
              value={points}
              onChange={setPoints}
              mb="sm"
              className="form-field-medium"
              min={1}
              allowDecimal={false}
              required
            />
            <Group position="right">
              <Button onClick={handleCreateEvent}>
                Create Event
              </Button>
            </Group>
          </Box>
        </Paper>
      </SimpleGrid>
    </Container>
  );
}

export default CreateEventPage;