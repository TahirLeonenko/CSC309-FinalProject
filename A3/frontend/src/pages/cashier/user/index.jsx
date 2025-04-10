import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Table,
  TextInput,
  Button,
  Group,
  Loader,
  Notification,
  Paper,
  Title,
  Stack,
} from '@mantine/core';
import { fetchUsers, createUser } from './fetchUser';
import './styles.css';

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [newUser, setNewUser] = useState({
    utorid: '',
    name: '',
    email: '',
  });
  const [createdUser, setCreatedUser] = useState(null);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();
  const currentPath = window.location.pathname;

  // Handle URL parameter changes
  useEffect(() => {
    if (id) {
      setUserId(id);
      handleSearch(id);
    }
  }, [id]);

  const handleSearch = (searchId = userId) => {
    setLoading(true);
    setError('');
    fetchUsers({ id: searchId }, setUsers, setTotalCount, setError, currentPath, navigate)
      .finally(() => setLoading(false));
  };

  const handleSearchSubmit = () => {
    if (userId) {
      // Update URL without causing navigation
      window.history.pushState({}, '', `/cashier/user/${userId}`);
      handleSearch(userId);
    }
  };

  const handleCreateUser = async () => {
    setLoading(true);
    setError('');
    const result = await createUser(newUser, setError, currentPath, navigate);
    if (result) {
      setCreatedUser(result);
      setNewUser({ utorid: '', name: '', email: '' });
      setSuccess('User created successfully');
    }
    setLoading(false);
  };

  const handleInputChange = (field) => (e) => {
    setNewUser({ ...newUser, [field]: e.target.value });
  };

  const gridRows = users.map((user, index) => (
    <div
      key={user.id}
      className={`user grid-row ${index % 2 === 0 ? 'even' : ''}`}
    >
      <div className="grid-cell">{user.id}</div>
      <div className="grid-cell">{user.utorid}</div>
      <div className="grid-cell email">{user.name}</div>
      <div className="grid-cell">{user.points}</div>
      <div className="grid-cell">{user.verified ? 'Yes' : 'No'}</div>
      <div className="grid-cell">
        {user.promotions && user.promotions.length > 0 ? (
          <div className="promotions-list">
            {user.promotions.map((promo) => (
              <div key={promo.id} className="promotion-item">
                <div>Name: {promo.name}</div>
                <div>Min Spending: {promo.minSpending || 'N/A'}</div>
                <div>Rate: {promo.rate || 'N/A'}</div>
                <div>Points: {promo.points}</div>
              </div>
            ))}
          </div>
        ) : (
          'No promotions'
        )}
      </div>
    </div>
  ));

  return (
    <Container my="md">
      <Title order={1} mb="md">Users</Title>
      
      {error && (
        <Notification color="red" mb="md" onClose={() => setError('')}>
          {error}
        </Notification>
      )}

      {success && (
        <Notification color="green" mb="md" onClose={() => setSuccess('')}>
          {success}
        </Notification>
      )}

      <Paper p="md" mb="md" withBorder>
        <Title order={2} mb="md">Search User</Title>
        <Group mb="md">
          <TextInput
            placeholder="Enter User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            style={{ width: '200px' }}
          />
          <Button onClick={handleSearchSubmit} disabled={!userId}>
            Search
          </Button>
        </Group>

        {loading ? (
          <Loader />
        ) : (
          <>
            <div className="grid-table">
              <div className="user grid-row header">
                <div className="grid-cell">ID</div>
                <div className="grid-cell">UTORID</div>
                <div className="grid-cell">Name</div>
                <div className="grid-cell">Points</div>
                <div className="grid-cell">Verified</div>
                <div className="grid-cell">Promotions</div>
              </div>
              {gridRows}
            </div>
          </>
        )}
      </Paper>

      <Paper p="md" mb="md" withBorder>
        <Title order={2} mb="md">Create New User</Title>
        <Stack spacing="md">
          <TextInput
            label="UTORID"
            placeholder="Enter UTORID"
            value={newUser.utorid}
            onChange={handleInputChange('utorid')}
            required
          />
          <TextInput
            label="Name"
            placeholder="Enter full name"
            value={newUser.name}
            onChange={handleInputChange('name')}
            required
          />
          <TextInput
            label="Email"
            placeholder="Enter email"
            value={newUser.email}
            onChange={handleInputChange('email')}
            required
          />
          <Button 
            onClick={handleCreateUser}
            disabled={!newUser.utorid || !newUser.name || !newUser.email}
          >
            Create User
          </Button>
        </Stack>
      </Paper>

      {createdUser && (
        <Paper p="md" mb="md" withBorder>
          <Title order={3} mb="sm">User Created Successfully</Title>
          <Stack spacing="xs">
            <div><strong>Reset Token:</strong> {createdUser.resetToken}</div>
            <div><strong>Token Expires At:</strong> {new Date(createdUser.expiresAt).toLocaleString()}</div>
          </Stack>
        </Paper>
      )}
    </Container>
  );
}

export default UsersPage;
