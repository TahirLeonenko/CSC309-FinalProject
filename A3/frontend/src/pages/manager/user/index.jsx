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
import Filters from '../components/filters/user';
import UserActionButton from '../components/updateUserButton';
import fetchUsers from './fetchUser';
import './styles.css';


function UsersPage() {
  const navigate = useNavigate();
  const [nameInput, setNameInput] = useState('');
  const [roleInput, setRoleInput] = useState('');
  const [verifiedInput, setVerifiedInput] = useState('');
  const [activatedInput, setActivatedInput] = useState('');
  const [sortByInput, setSortByInput] = useState('');
  const [sortOrderInput, setSortOrderInput] = useState('asc');

  const [queryParams, setQueryParams] = useState({
    name: '',
    role: '',
    verified: '',
    activated: '',
    sortBy: '',
    sortOrder: 'asc',
    page: 1,
    limit: 4,
  });

  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers(queryParams, setUsers, setTotalCount, setLoading, setError, '/manager/users', navigate);
  }, [queryParams]);

  // When "Apply Filters" is clicked, update the query parameters (and reset to page 1)
  const handleApplyFilters = () => {
    setQueryParams({
      name: nameInput,
      role: roleInput,
      verified: verifiedInput,
      activated: activatedInput,
      sortBy: sortByInput,
      sortOrder: sortOrderInput,
      page: 1,
      limit: 4,
    });
  };

  // Update pagination (this also triggers an API call)
  const handlePageChange = (newPage) => {
    setQueryParams((prev) => ({ ...prev, page: newPage }));
  };

  const gridRows = users.map((user, index) => (
    <div
      key={user.id}
      className={`user grid-row ${index % 2 === 0 ? 'even' : ''}`}
    >
      <div className="grid-cell">{user.utorid}</div>
      <div className="grid-cell">{user.name}</div>
      <div className="grid-cell email">{user.email}</div>
      <div className="grid-cell">{user.role}</div>
      <div className="grid-cell">{user.verified ? 'Yes' : 'No'}</div>
      <div className="grid-cell">
        {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
      </div>
      <div className="grid-cell"><UserActionButton userId={user.id} /></div>
    </div>
  ));

  return (
    <Container my="md">
      <h1>Users</h1>
      {error && (
        <Notification color="red" mb="md" onClose={() => setError('')}>
          {error}
        </Notification>
      )}
      <Filters
        nameInput={nameInput}
        setNameInput={setNameInput}
        roleInput={roleInput}
        setRoleInput={setRoleInput}
        verifiedInput={verifiedInput}
        setVerifiedInput={setVerifiedInput}
        activatedInput={activatedInput}
        setActivatedInput={setActivatedInput}
        sortByInput={sortByInput}
        setSortByInput={setSortByInput}
        sortOrderInput={sortOrderInput}
        setSortOrderInput={setSortOrderInput}
        handleApplyFilters={handleApplyFilters}
      />

      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="grid-table">
            {/* Header Row */}
            <div className="user grid-row header">
              <div className="grid-cell">UTORID</div>
              <div className="grid-cell">Name</div>
              <div className="grid-cell">Email</div>
              <div className="grid-cell">Role</div>
              <div className="grid-cell">Verified</div>
              <div className="grid-cell">Last Login</div>
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

export default UsersPage;
