import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './style.css';

import {
  Box,
  TextInput,
  Switch,
  Button,
  Paper,
  Title,
  Notification,
  LoadingOverlay,
  Group,
  Container,
  SimpleGrid,
} from '@mantine/core';

function AdjustTransactionPage() {
  const { transactionId } = useParams();
  const navigate = useNavigate();

  const [transactionData, setTransactionData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [suspicious, setSuspicious] = useState(false);
  const [amount, setAmount] = useState('');
  const [remark, setRemark] = useState('');
  const [promotionIds, setPromotionIds] = useState(''); // comma-separated IDs if needed

  useEffect(() => {
    fetchTransactionData();
  }, [transactionId]);

  const fetchTransactionData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3000/transactions/${transactionId}`, {
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
            // Unauthorized - redirect to login
            localStorage.removeItem('access_token');
            navigate(`/login?returnTo=/manager/transaction/adjust/${transactionId}`, { replace: true });
            return;
          case 403:
            throw new Error('You do not have permission to manage transactions.');
          case 404:
            throw new Error('Transaction not found');
          default:
            throw new Error(`Error ${res.status}: ${errorData.error || 'Unknown error'}`);
        }
      }

      const data = await res.json();
      setTransactionData(data);
      setSuspicious(data.suspicious ?? false);
    } catch (err) {
      console.error('Error fetching transaction data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSuspicious = async () => {
    if (!transactionData) {
      setError('No transaction data to update. Fetch a transaction first.');
      return;
    }

    if (suspicious === transactionData.suspicious) {
      setError('No changes made to suspicious status');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:3000/transactions/${transactionId}/suspicious`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ suspicious }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update suspicious status');
      }

      const updated = await res.json();
      setTransactionData((prev) => ({ ...prev, ...updated }));
      alert('Suspicious status updated successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdjustment = async () => {
    if (!transactionData) {
      setError('No base transaction data available for the adjustment.');
      return;
    }
    if (!amount || isNaN(Number(amount))) {
      setError('Please enter a valid numeric amount for the adjustment.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const body = {
        utorid: transactionData.utorid,
        type: 'adjustment',
        amount: Number(amount),
        relatedId: transactionData.id,
        remark,
      };

      if (promotionIds.trim()) {
        const parsed = promotionIds
          .split(',')
          .map((id) => parseInt(id.trim()))
          .filter((id) => !isNaN(id));
        if (parsed.length > 0) {
          body.promotionIds = parsed;
        }
      }

      const res = await fetch('http://localhost:3000/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create adjustment');
      }

      // If successful, just alert the user
      await res.json();
      alert('Adjustment transaction created successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container my="md">
      <h1>Adjust Transaction</h1>

      {error && (
        <Notification color="red" mb="md" onClose={() => setError('')}>
          {error}
        </Notification>
      )}

      {transactionData && (
        <SimpleGrid cols={1} spacing="lg" breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
          {/* Transaction info */}
          <Paper shadow="xs" p="md" mb="lg" style={{ position: 'relative' }}>
            <LoadingOverlay visible={loading} />
            <div className="user-table">
              <div className="user-row">
                <div className="user-label">Transaction ID</div>
                <div className="user-value">{transactionData.id}</div>
              </div>

              <div className="user-row">
                <div className="user-label">utorid</div>
                <div className="user-value">{transactionData.utorid}</div>
              </div>

              <div className="user-row">
                <div className="user-label">Type</div>
                <div className="user-value">{transactionData.type}</div>
              </div>

              <div className="user-row">
                <div className="user-label">Spent</div>
                <div className="user-value">{transactionData.spent}</div>
              </div>

              <div className="user-row">
                <div className="user-label">Amount</div>
                <div className="user-value">{transactionData.amount}</div>
              </div>

              <div className="user-row">
                <div className="user-label">Remark</div>
                <div className="user-value">{transactionData.remark}</div>
              </div>

              <div className="user-row">
                <div className="user-label">Suspicious</div>
                <div className="user-value">
                  {transactionData.suspicious ? 'Yes' : 'No'}
                </div>
              </div>

              <div className="user-row">
                <div className="user-label">Created By</div>
                <div className="user-value">{transactionData.createdBy}</div>
              </div>

              {transactionData.promotionIds && transactionData.promotionIds.length > 0 && (
                <div className="user-row">
                  <div className="user-label">Promotion IDs</div>
                  <div className="user-value">{transactionData.promotionIds.join(', ')}</div>
                </div>
              )}

              {transactionData.relatedId !== null && (
                <div className="user-row">
                  <div className="user-label">Related ID</div>
                  <div className="user-value">{transactionData.relatedId}</div>
                </div>
              )}
            </div>
          </Paper>

          <Paper shadow="xs" p="md" mb="lg" style={{ position: 'relative' }}>
            <Box mt="md">
              <Title order={4} mb="sm">
                Mark as Suspicious
              </Title>
              <Switch
                label="Suspicious"
                checked={suspicious}
                onChange={(event) => setSuspicious(event.currentTarget.checked)}
                mb="sm"
                className="form-field-small"
              />
              <Group position="right">
                <Button onClick={handleUpdateSuspicious}>
                  Update Suspicious Status
                </Button>
              </Group>
            </Box>

            <Box mt="xl">
              <Title order={4} mb="sm">
                Create Adjustment Transaction
              </Title>
              <TextInput
                label="Amount"
                value={amount}
                onChange={(e) => setAmount(e.currentTarget.value)}
                mb="sm"
                className="form-field-medium"
              />
              <TextInput
                label="Remark"
                value={remark}
                onChange={(e) => setRemark(e.currentTarget.value)}
                mb="sm"
                className="form-field-medium"
              />
              <TextInput
                label="Promotion IDs (comma-separated)"
                value={promotionIds}
                onChange={(e) => setPromotionIds(e.currentTarget.value)}
                mb="sm"
                className="form-field-medium"
              />
              <Group position="right">
                <Button onClick={handleCreateAdjustment}>
                  Create Adjustment
                </Button>
              </Group>
            </Box>
          </Paper>
        </SimpleGrid>
      )}
    </Container>
  );
}

export default AdjustTransactionPage;
