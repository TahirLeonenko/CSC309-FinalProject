import { useNavigate } from 'react-router-dom';

async function fetchUsers(queryParams, setUsers, setTotalCount, setError, currentPath, navigate) {
  try {
    if (!queryParams.id) {
      setUsers([]);
      setTotalCount(0);
      return;
    }

    const res = await fetch(`http://localhost:3000/users/${queryParams.id}`, {
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
          navigate(`/login?returnTo=${currentPath}`, { replace: true });
          throw new Error('Your session has expired. Please log in again.');
        case 403:
          throw new Error('You do not have permission to access user management.');
        case 404:
          setUsers([]);
          setTotalCount(0);
          return;
      }
    }

    const user = await res.json();
    setUsers([user]);
    setTotalCount(1);
  } catch (error) {
    setError(error.message);
  }
}

async function createUser(userData, setError, currentPath, navigate) {
  try {
    const res = await fetch('http://localhost:3000/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: JSON.stringify(userData),
    });

    if (!res.ok) {
      const errorData = await res.json();
      
      switch (res.status) {
        case 400:
          throw new Error(`Invalid request: ${errorData.error}`);
        case 401:
          localStorage.removeItem('access_token');
          navigate(`/login?returnTo=${currentPath}`, { replace: true });
          throw new Error('Your session has expired. Please log in again.');
        case 403:
          throw new Error('You do not have permission to create users.');
      }
    }

    return await res.json();
  } catch (error) {
    setError(error.message);
    return null;
  }
}

export { fetchUsers, createUser };