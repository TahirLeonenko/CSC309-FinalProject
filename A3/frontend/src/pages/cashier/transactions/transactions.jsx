// src/pages/TransactionsPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  TextInput,
  NumberInput,
  Button,
  Group,
  Loader,
  Notification,
  Paper,
  Title,
  Stack,
  Text,
  MultiSelect,
  Divider,
  Select,
} from '@mantine/core';
import './styles.css';

function TransactionsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [processError, setProcessError] = useState('');
  const [success, setSuccess] = useState('');
  const [newTransaction, setNewTransaction] = useState({
    utorid: '',
    type: '',
    spent: '',
    promotionIds: [],
    remark: '',
  });
  const [processTransaction, setProcessTransaction] = useState({
    transactionId: '',
    processed: true,
  });

  const handlePromotionIdsChange = (values) => {
    // Convert string values to numbers and filter out any invalid values
    const numericValues = values
      .map(value => {
        const num = Number(value);
        return isNaN(num) ? null : num;
      })
      .filter(value => value !== null);
    
    setNewTransaction({ ...newTransaction, promotionIds: numericValues });
  };

  const handleCreateTransaction = async () => {
    setLoading(true);
    setCreateError('');
    setSuccess('');
    
    try {
      const res = await fetch('http://localhost:3000/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          ...newTransaction,
          spent: Number(newTransaction.spent),
          promotionIds: newTransaction.promotionIds, // Already numbers from handlePromotionIdsChange
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (res.status === 401) {
          localStorage.removeItem('access_token');
          navigate('/login', { replace: true });
          throw new Error('Your session has expired. Please log in again.');
        }
        throw new Error(`Transaction creation failed (${res.status}): ${errorData.error || 'Unknown error'}`);
      }

      const data = await res.json();
      setSuccess(`Successfully created transaction ${data.id}`);
      setNewTransaction({
        utorid: '',
        type: '',
        spent: '',
        promotionIds: [],
        remark: '',
      });
    } catch (error) {
      setCreateError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessTransaction = async () => {
    setLoading(true);
    setProcessError('');
    setSuccess('');
    
    try {
      const res = await fetch(`http://localhost:3000/transactions/${processTransaction.transactionId}/processed`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          processed: processTransaction.processed,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (res.status === 401) {
          localStorage.removeItem('access_token');
          navigate('/login', { replace: true });
          throw new Error('Your session has expired. Please log in again.');
        }
        throw new Error(`Transaction processing failed (${res.status}): ${errorData.error || 'Unknown error'}`);
      }

      setSuccess(`Transaction ${processTransaction.transactionId} has been processed`);
      setProcessTransaction({
        transactionId: '',
        processed: true,
      });
    } catch (error) {
      setProcessError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field) => (value) => {
    setNewTransaction({ ...newTransaction, [field]: value });
  };

  return (
    <Container my="md">
      <Title order={1} mb="md">Transactions</Title>
      
      {success && (
        <Notification color="green" mb="md" onClose={() => setSuccess('')}>
          {success}
        </Notification>
      )}

      <Paper p="md" mb="md" withBorder>
        <Title order={2} mb="md">Create Transaction</Title>
        {createError && (
          <Notification color="red" mb="md" onClose={() => setCreateError('')}>
            {createError}
          </Notification>
        )}
        <Stack spacing="md">
          <TextInput
            label="UTORID"
            placeholder="Enter UTORID"
            value={newTransaction.utorid}
            onChange={(e) => handleInputChange('utorid')(e.target.value)}
            required
          />
          
          <Select
            label="Type"
            placeholder="Select transaction type"
            value={newTransaction.type}
            onChange={(value) => handleInputChange('type')(value)}
            data={[{ value: 'purchase', label: 'purchase' }]}
            required
          />
          
          <NumberInput
            label="Amount Spent"
            placeholder="Enter amount"
            value={newTransaction.spent}
            onChange={handleInputChange('spent')}
            precision={2}
            min={0}
            required
          />
          
          <MultiSelect
            label="Promotion IDs"
            placeholder="Enter promotion IDs (comma separated)"
            value={newTransaction.promotionIds.map(String)}
            onChange={handlePromotionIdsChange}
            data={[]}
            searchable
            creatable
            getCreateLabel={(query) => `+ Add ${query}`}
            onCreate={(query) => {
              const num = Number(query);
              return isNaN(num) ? null : { value: String(num), label: String(num) };
            }}
            description="Enter promotion IDs as numbers"
            error={newTransaction.promotionIds.some(id => isNaN(id)) ? "All promotion IDs must be numbers" : null}
          />
          
          <TextInput
            label="Remark"
            placeholder="Enter remark (optional)"
            value={newTransaction.remark}
            onChange={(e) => handleInputChange('remark')(e.target.value)}
          />
          
          <Button 
            onClick={handleCreateTransaction}
            disabled={!newTransaction.utorid || !newTransaction.type || !newTransaction.spent}
            loading={loading}
          >
            Create Transaction
          </Button>
        </Stack>
      </Paper>

      <Paper p="md" withBorder>
        <Title order={2} mb="md">Process Redemption Transaction</Title>
        {processError && (
          <Notification color="red" mb="md" onClose={() => setProcessError('')}>
            {processError}
          </Notification>
        )}
        <Stack spacing="md">
          <TextInput
            label="Transaction ID"
            placeholder="Enter transaction ID"
            value={processTransaction.transactionId}
            onChange={(e) => setProcessTransaction({ ...processTransaction, transactionId: e.target.value })}
            required
          />
          
          <Button 
            onClick={handleProcessTransaction}
            disabled={!processTransaction.transactionId}
            loading={loading}
          >
            Process Transaction
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}

export default TransactionsPage;
