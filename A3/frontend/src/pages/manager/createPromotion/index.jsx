import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Box,
  TextInput,
  Textarea,
  Select,
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

function CreatePromotionPage() {
  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [minSpending, setMinSpending] = useState('');
  const [rate, setRate] = useState('');
  const [points, setPoints] = useState('');

  const handleCreatePromotion = async () => {
    // Basic validation
    if (!name || !description || !type || !startTime || !endTime) {
      setError('Please fill all required fields (name, description, type, startTime, endTime).');
      return;
    }

    if (startTime >= endTime) {
      setError('End time must be strictly after start time.');
      return;
    }

    // Construct body
    const body = {
      name,
      description,
      type,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    };
    if (minSpending !== '') {
      const msVal = Number(minSpending);
      if (isNaN(msVal) || msVal <= 0) {
        setError('Min Spending must be a positive number if provided.');
        return;
      }
      body.minSpending = msVal;
    }
    if (rate !== '') {
      const rateVal = Number(rate);
      if (isNaN(rateVal) || rateVal <= 0) {
        setError('Rate must be a positive number if provided.');
        return;
      }
      body.rate = rateVal;
    }
    if (points !== '') {
      const ptsVal = Number(points);
      if (isNaN(ptsVal) || ptsVal < 0 || !Number.isInteger(ptsVal)) {
        setError('Points must be a non-negative integer if provided.');
        return;
      }
      body.points = ptsVal;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3000/promotions', {
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
            navigate('/login?returnTo=/manager/promotions/create', { replace: true });
            throw new Error('Your session has expired. Please log in again.');
          case 403:
            throw new Error('You do not have permission to create promotions.');
          default:
            throw new Error(errorData.error || 'Failed to create promotion');
        }
      }

      alert('Promotion created successfully!');
      navigate('/manager/promotions'); // Redirect to promotions list
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container my="md">
      <h1>Create Promotion</h1>

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
              Promotion Details
            </Title>
            <TextInput
              label="Name"
              placeholder="e.g. Summer Promo"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              mb="sm"
              required
              className='form-field-medium'
            />
            <Textarea
              label="Description"
              placeholder="Describe this promotion"
              value={description}
              onChange={(e) => setDescription(e.currentTarget.value)}
              mb="sm"
              required
              className='form-field-medium'
            />
            <Select
              label="Type"
              placeholder="Select type"
              data={[
                { value: 'automatic', label: 'Automatic' },
                { value: 'one-time', label: 'One-Time' },
              ]}
              value={type}
              onChange={setType}
              mb="sm"
              required
              className='form-field-medium'
            />
            <DateTimePicker
              label="Start Time"
              placeholder="Pick start date and time"
              value={startTime}
              onChange={setStartTime}
              mb="sm"
              required
              className='form-field-medium'
            />
            <DateTimePicker
              label="End Time"
              placeholder="Pick end date and time"
              value={endTime}
              onChange={setEndTime}
              mb="sm"
              required
              className='form-field-medium'
            />
            <NumberInput
              label="Min Spending (optional)"
              placeholder="e.g. 50"
              value={minSpending}
              onChange={(val) => setMinSpending(val || '')}
              mb="sm"
              className='form-field-medium'
            />
            <NumberInput
              label="Rate (optional)"
              description="Discount rate if it applies, e.g., 10 means 10% discount"
              placeholder="e.g. 10"
              value={rate}
              onChange={(val) => setRate(val || '')}
              mb="sm"
              className='form-field-medium'
            />
            <NumberInput
              label="Points (optional)"
              placeholder="e.g. 100"
              value={points}
              onChange={(val) => setPoints(val || '')}
              mb="sm"
              className='form-field-medium'
            />
            <Group position="right">
              <Button onClick={handleCreatePromotion}>
                Create Promotion
              </Button>
            </Group>
          </Box>
        </Paper>
      </SimpleGrid>
    </Container>
  );
}

export default CreatePromotionPage;
