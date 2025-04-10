async function addOrganizer(eventId, utorid, setError, currentPath, navigate, setOrga) {
  try {
    const res = await fetch(`http://localhost:3000/events/${eventId}/organizers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: JSON.stringify({ utorid }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      switch (res.status) {
        case 400:
          throw new Error(`Invalid request: ${errorData.error}`);
        case 401:
          // Token expired or user not logged in; handle appropriately
          localStorage.removeItem('access_token');
          navigate(`/login?returnTo=${currentPath}`, { replace: true });
          throw new Error('Your session has expired. Please log in again.');
        case 403:
          throw new Error('You do not have permission to add an organizer.');
        case 404:
          throw new Error(errorData.error || 'Event or user not found.');
        case 410:
          throw new Error('Cannot add organizer; the event has ended.');
        default:
          throw new Error(errorData.error || 'Error adding organizer.');
      }
    }

    // If success, return the updated event data (with new organizers)
    const data = await res.json();
    const addedOrga = data.organizers.find((org) => org.utorid === utorid);
    setOrga((prev) => [...prev, addedOrga]);
    return data;
  } catch (err) {
    setError(err.message);
  }
}

async function removeOrganizer(eventId, userId, setError, currentPath, navigate, setOrga) {
  try {
    const res = await fetch(`http://localhost:3000/events/${eventId}/organizers/${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
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
          throw new Error('You do not have permission to remove an organizer.');
        case 404:
          throw new Error(errorData.error || 'Event not found.');
        default:
          throw new Error(errorData.error || 'Error removing organizer.');
      }
    }

    // On successful DELETE, the server returns 204 (no content)
    setOrga((prev) => prev.filter((org) => org.id !== userId));
    return true;
  } catch (err) {
    setError(err.message);
  }
}

async function addGuest(eventId, utorid, setError, currentPath, navigate, setGuests) {
  try {
    const res = await fetch(`http://localhost:3000/events/${eventId}/guests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: JSON.stringify({ utorid }),
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
          throw new Error('You do not have permission to add a guest.');
        case 404:
          throw new Error(errorData.error || 'Event or user not found.');
        case 410:
          throw new Error(errorData.error || 'Event has ended or is full.');
        default:
          throw new Error(errorData.error || 'Error adding guest.');
      }
    }

    // If success, return the updated event data (with new guest info)
    const data = await res.json();
    const addedGuest = data.guestAdded
    setGuests((prev) => [...prev, addedGuest]);
    return data;
  } catch (err) {
    setError(err.message);
  }
}

async function removeGuest(eventId, userId, setError, currentPath, navigate, setGuests) {
  try {
    const res = await fetch(`http://localhost:3000/events/${eventId}/guests/${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
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
          throw new Error('You do not have permission to remove a guest.');
        case 404:
          throw new Error(errorData.error || 'Event not found.');
        default:
          throw new Error(errorData.error || 'Error removing guest.');
      }
    }

    // On successful DELETE, the server returns 204 (no content)
    setGuests((prev) => prev.filter((guest) => guest.id !== userId));
    return true;
  } catch (err) {
    setError(err.message);
  }
}

export { addOrganizer, removeOrganizer, addGuest, removeGuest };