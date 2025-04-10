// src/pages/TransactionsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Group, Pagination, Loader, Notification } from '@mantine/core';
import TransactionsFilters from '../components/filters/transactions';
import TransactionActionButton from '../components/AdjustTransactionButton';
import './styles.css';

function TransactionsPage() {
  const navigator = useNavigate();

  // Filter states
  const [nameInput, setNameInput] = useState('');
  const [createdByInput, setCreatedByInput] = useState('');
  const [suspiciousInput, setSuspiciousInput] = useState('');
  const [promotionIdInput, setPromotionIdInput] = useState('');
  const [typeInput, setTypeInput] = useState('');
  const [relatedIdInput, setRelatedIdInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [operatorInput, setOperatorInput] = useState('');

  const [error, setError] = useState('');

  // Query params state
  const [queryParams, setQueryParams] = useState({
    name: '',
    createdBy: '',
    suspicious: '',
    promotionId: '',
    type: '',
    relatedId: '',
    amount: '',
    operator: '',
    page: 1,
    limit: 4,
  });

  const [transactions, setTransactions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch transactions from API when queryParams changes
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const qp = new URLSearchParams();
      qp.append('page', queryParams.page);
      qp.append('limit', queryParams.limit);

      if (queryParams.name) qp.append('name', queryParams.name);
      if (queryParams.createdBy) qp.append('createdBy', queryParams.createdBy);
      if (queryParams.suspicious !== '') qp.append('suspicious', queryParams.suspicious);
      if (queryParams.promotionId) qp.append('promotionId', queryParams.promotionId);
      if (queryParams.type) qp.append('type', queryParams.type);
      if (queryParams.relatedId) qp.append('relatedId', queryParams.relatedId);
      if (queryParams.amount) qp.append('amount', queryParams.amount);
      if (queryParams.operator) qp.append('operator', queryParams.operator);

      const res = await fetch(`http://localhost:3000/transactions?${qp.toString()}`, {
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
            // Unauthorized - likely need to redirect to login
            localStorage.removeItem('access_token');
            navigator('/login?returnTo=/manager/transactions', { replace: true });
            throw new Error('Your session has expired. Please log in again.');
          case 403:
            throw new Error('You do not have permission to access this resource.');
          default:
            throw new Error(errorData.error || 'Error fetching transactions');
        }
      }
      const data = await res.json();
      setTransactions(data.results);
      setTotalCount(data.count);
      setError(''); // Clear any previous error
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [queryParams]);

  // When "Apply Filters" is clicked, update the query parameters (and reset to page 1)
  const handleApplyFilters = () => {
    setQueryParams({
      name: nameInput,
      createdBy: createdByInput,
      suspicious: suspiciousInput,
      promotionId: promotionIdInput,
      type: typeInput,
      relatedId: relatedIdInput,
      amount: amountInput,
      operator: operatorInput,
      page: 1,
      limit: 4,
    });
  };

  // Update pagination (this also triggers an API call)
  const handlePageChange = (newPage) => {
    setQueryParams((prev) => ({ ...prev, page: newPage }));
  };

  // Build rows
  const gridRows = transactions.map((tx, index) => (
    <div
      key={tx.id}
      className={`transaction grid-row ${index % 2 === 0 ? 'even' : ''}`}
    >
      <div className="grid-cell">{tx.id}</div>
      <div className="grid-cell">{tx.utorid}</div>
      <div className="grid-cell">{tx.type}</div>
      <div className="grid-cell">{tx.amount}</div>
      <div className="grid-cell">{tx.suspicious ? 'Yes' : 'No'}</div>
      <div className="grid-cell">{tx.createdBy}</div>
      <div className="grid-cell">{tx.relatedId ? tx.relatedId : '-'}</div>
      <div className="grid-cell"><TransactionActionButton tId={tx.id} /></div>
    </div>
  ));

  return (
    <Container my="md">
      <h1>Transactions</h1>
      {error && (
        <Notification color="red" mb="md" onClose={() => setError('')}>
          {error}
        </Notification>
      )}

      <TransactionsFilters
        nameInput={nameInput}
        setNameInput={setNameInput}
        createdByInput={createdByInput}
        setCreatedByInput={setCreatedByInput}
        suspiciousInput={suspiciousInput}
        setSuspiciousInput={setSuspiciousInput}
        promotionIdInput={promotionIdInput}
        setPromotionIdInput={setPromotionIdInput}
        typeInput={typeInput}
        setTypeInput={setTypeInput}
        relatedIdInput={relatedIdInput}
        setRelatedIdInput={setRelatedIdInput}
        amountInput={amountInput}
        setAmountInput={setAmountInput}
        operatorInput={operatorInput}
        setOperatorInput={setOperatorInput}
        handleApplyFilters={handleApplyFilters}
      />

      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="grid-table">
            {/* Header Row */}
            <div className="transaction grid-row header">
              <div className="grid-cell">ID</div>
              <div className="grid-cell">UTORID</div>
              <div className="grid-cell">Type</div>
              <div className="grid-cell">Amount</div>
              <div className="grid-cell">Suspicious</div>
              <div className="grid-cell">Created By</div>
              <div className="grid-cell">Related ID</div>
            </div>
            {/* Data Rows */}
            {gridRows}
          </div>

          <Group position="center" mt="md">
            <Pagination
              value={queryParams.page}
              onChange={handlePageChange}
              total={Math.ceil(totalCount / queryParams.limit)}
            />
          </Group>
        </>
      )}
    </Container>
  );
}

export default TransactionsPage;
