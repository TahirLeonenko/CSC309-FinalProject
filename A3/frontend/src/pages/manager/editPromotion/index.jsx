import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  TextInput,
  Textarea,
  Select,
  NumberInput,
  Button,
  Paper,
  Title,
  Notification,
  LoadingOverlay,
  Group,
  Container,
  SimpleGrid,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';

function UpdatePromotionPage() {
  const { promotionId } = useParams();
  const navigate = useNavigate();

  const [promotionData, setPromotionData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Editable fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [minSpending, setMinSpending] = useState('');
  const [rate, setRate] = useState('');
  const [points, setPoints] = useState('');

  useEffect(() => {
    fetchPromotion();
  }, [promotionId]);

  const fetchPromotion = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await fetch(`http://localhost:3000/promotions/${promotionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        switch (res.status) {
          case 400:
            throw new Error(`Invalid request: ${errorData.error}`);
          case 401:
            localStorage.removeItem('access_token');
            navigate(`/login?returnTo=/manager/promotion/update/${promotionId}`, { replace: true });
            return;
          case 403:
            throw new Error('You do not have permission to update promotions.');
          case 404:
            throw new Error('Promotion not found');
          default:
            throw new Error(errorData.error || 'Failed to fetch promotion');
        }
      }

      const data = await res.json();
      setPromotionData(data);

      // Pre-populate fields
      setName(data.name);
      setDescription(data.description || '');
      setType(data.type || '');
      setStartTime(data.startTime ? new Date(data.startTime) : null);
      setEndTime(data.endTime ? new Date(data.endTime) : null);
      setMinSpending(data.minSpending ?? '');
      setRate(data.rate ?? '');
      setPoints(data.points ?? '');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePromotion = async () => {
    if (!promotionData) {
      setError('No promotion data to update.');
      return;
    }

    // Build patch request body only with changed fields
    const body = {};
    if (name !== promotionData.name) body.name = name;
    if (description !== promotionData.description) body.description = description;
    if (type !== promotionData.type) body.type = type;
    if (startTime && startTime.toISOString() !== promotionData.startTime) {
      body.startTime = startTime.toISOString();
    }
    if (endTime && endTime.toISOString() !== promotionData.endTime) {
      body.endTime = endTime.toISOString();
    }

    // MinSpending
    if (String(minSpending) !== String(promotionData.minSpending ?? '')) {
      const val = Number(minSpending);
      if (isNaN(val) || val <= 0) {
        setError('Min Spending must be a positive number if provided.');
        return;
      }
      body.minSpending = val;
    }

    // Rate
    if (String(rate) !== String(promotionData.rate ?? '')) {
      const val = Number(rate);
      if (isNaN(val) || val <= 0) {
        setError('Rate must be a positive number if provided.');
        return;
      }
      body.rate = val;
    }

    // Points
    if (String(points) !== String(promotionData.points ?? '')) {
      const val = Number(points);
      if (isNaN(val) || val <= 0 || !Number.isInteger(val)) {
        setError('Points must be a positive integer.');
        return;
      }
      body.points = val;
    }

    if (Object.keys(body).length === 0) {
      setError('No changes detected.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`http://localhost:3000/promotions/${promotionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update promotion.');
      }

      alert('Promotion updated successfully!');
      navigate('/manager/promotions');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container my="md">
      <h1>Update Promotion</h1>

      {error && (
        <Notification color="red" mb="md" onClose={() => setError('')}>
          {error}
        </Notification>
      )}

      {promotionData && (
        <SimpleGrid cols={1} spacing="lg" breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
          <Paper shadow="xs" p="md" mb="lg" style={{ position: 'relative' }}>
            <LoadingOverlay visible={loading} />

            <Box mt="md">
              <Title order={4} mb="sm">
                Current Promotion
              </Title>

              <div className="user-table">
                <div className="user-row">
                  <div className="user-label">Promotion ID</div>
                  <div className="user-value">{promotionData.id}</div>
                </div>

                <div className="user-row">
                  <div className="user-label">Name</div>
                  <div className="user-value">{promotionData.name}</div>
                </div>

                <div className="user-row">
                  <div className="user-label">Description</div>
                  <div className="user-value">{promotionData.description}</div>
                </div>

                <div className="user-row">
                  <div className="user-label">Type</div>
                  <div className="user-value">{promotionData.type}</div>
                </div>

                {promotionData.startTime && (
                  <div className="user-row">
                    <div className="user-label">Start Time</div>
                    <div className="user-value">
                      {new Date(promotionData.startTime).toLocaleString()}
                    </div>
                  </div>
                )}

                {promotionData.endTime && (
                  <div className="user-row">
                    <div className="user-label">End Time</div>
                    <div className="user-value">
                      {new Date(promotionData.endTime).toLocaleString()}
                    </div>
                  </div>
                )}

                <div className="user-row">
                  <div className="user-label">Min Spending</div>
                  <div className="user-value">{promotionData.minSpending ?? '-'}</div>
                </div>

                <div className="user-row">
                  <div className="user-label">Rate</div>
                  <div className="user-value">{promotionData.rate ?? '-'}</div>
                </div>

                <div className="user-row">
                  <div className="user-label">Points</div>
                  <div className="user-value">{promotionData.points ?? '-'}</div>
                </div>
              </div>
            </Box>
          </Paper>

          <Paper shadow="xs" p="md" mb="lg" style={{ position: 'relative' }}>
            <LoadingOverlay visible={loading} />
            <Box mt="md">
              <Title order={4} mb="sm">
                Update Fields
              </Title>
              <TextInput
                label="Name"
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
                mb="sm"
              />
              <Textarea
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.currentTarget.value)}
                mb="sm"
              />
              <Select
                label="Type"
                data={[
                  { value: 'automatic', label: 'Automatic' },
                  { value: 'one-time', label: 'One-Time' },
                ]}
                value={type}
                onChange={setType}
                mb="sm"
              />
              <DateTimePicker
                label="Start Time"
                placeholder="Pick start date and time"
                value={startTime}
                onChange={setStartTime}
                mb="sm"
              />
              <DateTimePicker
                label="End Time"
                placeholder="Pick end date and time"
                value={endTime}
                onChange={setEndTime}
                mb="sm"
              />
              <NumberInput
                label="Min Spending"
                value={minSpending}
                onChange={(val) => setMinSpending(val || '')}
                mb="sm"
              />
              <NumberInput
                label="Rate"
                value={rate}
                onChange={(val) => setRate(val || '')}
                mb="sm"
              />
              <NumberInput
                label="Points"
                value={points}
                onChange={(val) => setPoints(val || '')}
                mb="sm"
              />
              <Group position="right">
                <Button onClick={handleUpdatePromotion}>
                  Update Promotion
                </Button>
              </Group>
            </Box>
          </Paper>
        </SimpleGrid>
      )}
    </Container>
  );
}

export default UpdatePromotionPage;
