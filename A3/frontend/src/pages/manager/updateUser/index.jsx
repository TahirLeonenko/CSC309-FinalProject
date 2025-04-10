import React, { useState, useEffect} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './style.css';

import {
  Box,
  TextInput,
  Switch,
  Select,
  Button,
  Paper,
  Title,
  Notification,
  LoadingOverlay,
  Group,
  Container,
  SimpleGrid,
  Card,
  Table,
} from '@mantine/core';

function UpdateUserPage() {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fields for updating
  const [email, setEmail] = useState('');
  const [verified, setVerified] = useState(false);
  const [suspicious, setSuspicious] = useState(false);
  const [role, setRole] = useState('regular');

  const navigate = useNavigate();
  const userRole = localStorage.getItem('role') || 'regular';
  const managerSwitch = [
    { value: 'regular', label: 'Regular' },
    { value: 'cashier', label: 'Cashier' },
  ]
  const superSwitch = [
    { value: 'regular', label: 'Regular' },
    { value: 'cashier', label: 'Cashier' },
    { value: 'manager', label: 'Manager' },
    { value: 'superuser', label: 'SuperUser' },
  ]
  let roleSwitch = [];
  if (userRole === 'superuser') {
    roleSwitch = superSwitch;
  } else if (userRole === 'manager') {
    roleSwitch = managerSwitch;
  }


  useEffect(() => {
    // Fetch user data when component mounts
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      const res = await fetch(`http://localhost:3000/users/${userId}`, {
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
            navigate(`/login?returnTo=/manager/user/update/${userId}`, { replace: true });
            return; // Stop execution
          case 403:
            throw new Error('You do not have permission to access user management.');
          case 404:
            throw new Error('User not found');
          default:
            throw new Error(`Error ${res.status}: ${errorData.error || 'Unknown error'}`);
        }
      }

      const data = await res.json();
      setUserData(data);

      // Pre-fill the update fields
      setEmail(data.email ?? '');
      setVerified(data.verified ?? false);
      setSuspicious(data.suspicious ?? false);
      setRole(data.role?.toLowerCase() ?? 'regular');
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Update user
  const handleUpdateUser = async () => {
    if (!userData) {
      setError('No user data to update. Fetch a user first.');
      return;
    }

    // Build the body with only changed fields
    const patchBody = {};

    if (email.trim() && email !== userData.email) patchBody.email = email.trim();
    if (verified !== userData.verified) patchBody.verified = verified;
    if (suspicious !== userData.suspicious) patchBody.suspicious = suspicious;
    if (role.toLowerCase() !== userData.role?.toLowerCase()) patchBody.role = role;

    if (Object.keys(patchBody).length === 0) {
      setError('No changes made');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(patchBody),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update user');
      }

      const updated = await res.json();

      // Merge changes into local userData
      setUserData((prev) => ({ ...prev, ...updated }));
      alert('User updated successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container my="md">
      <h1>Update User</h1>

      {error && (
        <Notification color="red" mb="md" onClose={() => setError('')}>
          {error}
        </Notification>
      )}

      {/* Show user info at the top, if it exists */}
      {userData && (
      <SimpleGrid cols={1} spacing="lg" breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
        <Paper shadow="xs" p="md" mb="lg" style={{ position: 'relative' }}>
          <LoadingOverlay visible={loading} />

          <div className="user-table">
            <div className="user-row">
              <div className="user-label">User ID</div>
              <div className="user-value">{userData.id}</div>
            </div>

            <div className="user-row">
              <div className="user-label">Name</div>
              <div className="user-value">{userData.name}</div>
            </div>

            <div className="user-row">
              <div className="user-label">Email</div>
              <div className="user-value">{userData.email}</div>
            </div>

            <div className="user-row">
              <div className="user-label">Role</div>
              <div className="user-value">{userData.role}</div>
            </div>

            <div className="user-row">
              <div className="user-label">Verified</div>
              <div className="user-value">
                {userData.verified ? 'Yes' : 'No'}
              </div>
            </div>

            <div className="user-row">
              <div className="user-label">Suspicious</div>
              <div className="user-value">
                {userData.suspicious ? 'Yes' : 'No'}
              </div>
            </div>

            <div className="user-row">
              <div className="user-label">Points</div>
              <div className="user-value">{userData.points}</div>
            </div>
          </div>

        </Paper>
        <Paper shadow="xs" p="md" mb="lg" style={{ position: 'relative' }}>

          <Box mt="md">
            <Title order={4} mb="sm">
              Update User
            </Title>

            <TextInput
              label="Email (must end with @mail.utoronto.ca)"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              mb="sm"
              className='form-field-medium'
            />
            <Switch
              label="Verified"
              checked={verified}
              onChange={(event) => setVerified(event.currentTarget.checked)}
              mb="sm"
              className='form-field-small'
            />
            <Switch
              label="Suspicious"
              checked={suspicious}
              onChange={(event) => setSuspicious(event.currentTarget.checked)}
              mb="sm"
              className='form-field-small'
            />
            <Select
              label="Role"
              data={roleSwitch}
              value={role}
              onChange={setRole}
              mb="sm"
              className='form-field-small'
            />

            <Group position="right">
              <Button onClick={handleUpdateUser}>Update User</Button>
            </Group>
          </Box>
        </Paper>
      </SimpleGrid>
      )}
    </Container>
  );
}

export default UpdateUserPage;
