import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Table,
  TextInput,
  Select,
  Button,
  Group,
  Pagination,
  Loader,
  Notification,
} from '@mantine/core';
import fetchPromotions from './fetchPromotions';
import EditPromoButton from '../components/editPromoButton';
import './styles.css';

function PromotionsPage() {
  const navigate = useNavigate();
  const [nameInput, setNameInput] = useState('');
  const [typeInput, setTypeInput] = useState('');

  const [queryParams, setQueryParams] = useState({
    name: '',
    type: '',
    page: 1,
    limit: 5,
  });

  const [promotions, setPromotions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchPromotions(queryParams, setPromotions, setTotalCount, setError, '/manager/promotions', navigate)
      .finally(() => setLoading(false));
  }, [queryParams]);

  const handleApplyFilters = () => {
    setQueryParams({
      name: nameInput,
      type: typeInput,
      page: 1,
      limit: 5,
    });
  };

  const handlePageChange = (newPage) => {
    setQueryParams((prev) => ({ ...prev, page: newPage }));
  };

  const handleCreatePromo = () => {
    navigate('/manager/promotions/create');
  };

  const gridRows = promotions.map((promo, index) => (
    <div
      key={promo.id}
      className={`promo grid-row ${index % 2 === 0 ? 'even' : ''}`}
    >
      <div className="grid-cell">{promo.id}</div>
      <div className="grid-cell">{promo.name}</div>
      <div className="grid-cell">{promo.type}</div>
      <div className="grid-cell">{promo.endTime && new Date(promo.endTime).toLocaleString()}</div>
      <div className="grid-cell">{promo.minSpending ?? '-'}</div>
      <div className="grid-cell">{promo.rate ?? '-'}</div>
      <div className="grid-cell">{promo.points ?? '-'}</div>
      <div className='grid-cell'><EditPromoButton promoId={promo.id} /></div>
    </div>
  ));

  return (
    <Container my="md">
      <h1>Promotions</h1>
      {error && (
        <Notification color="red" mb="md" onClose={() => setError('')}>
          {error}
        </Notification>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <TextInput
          label="Promotion Name"
          placeholder="Search by name"
          value={nameInput}
          onChange={(e) => setNameInput(e.currentTarget.value)}
          style={{ minWidth: 200 }}
        />
        <Select
          label="Type"
          placeholder="All types"
          data={[
            { value: 'automatic', label: 'Automatic' },
            { value: 'one-time', label: 'One-Time' },
          ]}
          value={typeInput}
          onChange={(val) => setTypeInput(val ?? '')}
          clearable
          style={{ minWidth: 150 }}
        />
        <Button onClick={handleApplyFilters} style={{ alignSelf: 'end' }}>
          Apply Filters
        </Button>
        <Button onClick={handleCreatePromo} style={{ alignSelf: 'end' }}>
          Create Promotion
        </Button>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="grid-table">
            {/* Header Row */}
            <div className="promo grid-row header">
              <div className="grid-cell">ID</div>
              <div className="grid-cell">Name</div>
              <div className="grid-cell">Type</div>
              <div className="grid-cell">End Time</div>
              <div className="grid-cell">Min Spending</div>
              <div className="grid-cell">Rate</div>
              <div className="grid-cell">Points</div>
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

export default PromotionsPage;
