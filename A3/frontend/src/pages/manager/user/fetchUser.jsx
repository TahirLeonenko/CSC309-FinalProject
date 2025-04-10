import { useNavigate } from 'react-router-dom';
async function fetchUsers(queryParams, setUsers, setTotalCount, setError, currentPath, navigate) {
  try {
    const qp = new URLSearchParams();
    qp.append('page', queryParams.page);
    qp.append('limit', queryParams.limit);
    if (queryParams.name) qp.append('name', queryParams.name);
    if (queryParams.role) qp.append('role', queryParams.role);
    if (queryParams.verified !== '') qp.append('verified', queryParams.verified);
    if (queryParams.activated !== '') qp.append('activated', queryParams.activated);
    if (queryParams.sortBy) {
      qp.append('sortBy', queryParams.sortBy);
      qp.append('sortOrder', queryParams.sortOrder);
    }
    const res = await fetch(`http://localhost:3000/users?${qp.toString()}`,{
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
      }
    }
    const data = await res.json();
    setUsers(data.results);
    setTotalCount(data.count);
  } catch (error) {
    setError(error.message);
  } 
};

export default fetchUsers;