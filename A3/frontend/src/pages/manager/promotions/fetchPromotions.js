async function fetchPromotions(queryParams, setPromotions, setTotalCount, setError, currentPath, navigate) {
  try {
    const qp = new URLSearchParams();
    qp.append('page', queryParams.page);
    qp.append('limit', queryParams.limit);

    if (queryParams.name) qp.append('name', queryParams.name);
    if (queryParams.type) qp.append('type', queryParams.type);

    const res = await fetch(`http://localhost:3000/promotions?${qp.toString()}`, {
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
          throw new Error('You do not have permission to view promotions.');
        default:
          throw new Error(errorData.error || 'Failed to fetch promotions.');
      }
    }

    const data = await res.json();
    setPromotions(data.results);
    setTotalCount(data.count);
  } catch (error) {
    setError(error.message);
  }
}

export default fetchPromotions;
