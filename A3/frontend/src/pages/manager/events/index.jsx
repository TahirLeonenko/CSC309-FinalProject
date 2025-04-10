import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Group, Pagination, Loader, Notification, Flex, TextInput, Select, Button, Box } from '@mantine/core';
import './styles.css';
import EventsFilters from '../components/filters/events';
import EditEventButton from '../components/editEventButton';
import EventTable from './eventTable';

function EventsPage() {
  const navigator = useNavigate();

  // Filter states
  const [nameInput, setNameInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [startedInput, setStartedInput] = useState('');
  const [endedInput, setEndedInput] = useState('');
  const [showFullInput, setShowFullInput] = useState('');
  const [publishedInput, setPublishedInput] = useState('');

  const [error, setError] = useState('');

  // Query params state
  const [queryParams, setQueryParams] = useState({
    name: '',
    location: '',
    started: '',
    ended: '',
    showFull: '',
    published: '',
    page: 1,
    limit: 4,
  });

  const [events, setEvents] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch events from API when queryParams changes
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const qp = new URLSearchParams();
      qp.append('page', queryParams.page);
      qp.append('limit', queryParams.limit);

      if (queryParams.name) qp.append('name', queryParams.name);
      if (queryParams.location) qp.append('location', queryParams.location);
      if (queryParams.started !== '') qp.append('started', queryParams.started);
      if (queryParams.ended !== '') qp.append('ended', queryParams.ended);
      if (queryParams.showFull !== '') qp.append('showFull', queryParams.showFull);
      if (queryParams.published !== '') qp.append('published', queryParams.published);

      const res = await fetch(`http://localhost:3000/events?${qp.toString()}`, {
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
            localStorage.removeItem('access_token');
            navigator('/login?returnTo=/manager/events', { replace: true });
            throw new Error('Your session has expired. Please log in again.');
          case 403:
            throw new Error('You do not have permission to access this resource.');
          default:
            throw new Error(errorData.error || 'Error fetching events');
        }
      }
      const data = await res.json();
      setEvents(data.results);
      setTotalCount(data.count);
      setError('');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [queryParams]);

  // When "Apply Filters" is clicked, update the query parameters (and reset to page 1)
  const handleApplyFilters = () => {
    setQueryParams({
      name: nameInput,
      location: locationInput,
      started: startedInput,
      ended: endedInput,
      showFull: showFullInput,
      published: publishedInput,
      page: 1,
      limit: 4,
    });
  };

  // Update pagination (this also triggers an API call)
  const handlePageChange = (newPage) => {
    setQueryParams((prev) => ({ ...prev, page: newPage }));
  };

  const handleCreateEvent = () => {
    navigator('/manager/events/create', { replace: true });
  }

  // Build rows
  const gridRows = events.map((event, index) => (
    <div
      key={event.id}
      className={`event grid-row ${index % 2 === 0 ? 'even' : ''}`}
    >
      <div className="grid-cell">{event.id}</div>
      <div className="grid-cell">{event.name}</div>
      <div className="grid-cell">{event.location}</div>
      <div className="grid-cell">{new Date(event.startTime).toLocaleString()}</div>
      <div className="grid-cell">{new Date(event.endTime).toLocaleString()}</div>
      {/* 
        <div className="grid-cell">
          {new Date(event.startTime).toLocaleDateString()}
          <br />
          {new Date(event.startTime).toLocaleTimeString()}
        </div>

        <div className="grid-cell">
          {new Date(event.endTime).toLocaleDateString()}
          <br />
          {new Date(event.endTime).toLocaleTimeString()}
        </div>
       */}
      <div className="grid-cell">{event.capacity || '-'}</div>
      <div className="grid-cell">{event.numGuests}</div>
      <div className="grid-cell">{event.published !== undefined ? (event.published ? 'Yes' : 'No') : '-'}</div>
      <div className="grid-cell"><EditEventButton eventId={event.id}/></div>

    </div>
  ));

  return (
    <Container my="md">
      <h1>Events</h1>
      {error && (
        <Notification color="red" mb="md" onClose={() => setError('')}>
          {error}
        </Notification>
      )}

      <EventsFilters
        nameInput={nameInput}
        setNameInput={setNameInput}
        locationInput={locationInput}
        setLocationInput={setLocationInput}
        startedInput={startedInput}
        setStartedInput={setStartedInput}
        endedInput={endedInput}
        setEndedInput={setEndedInput}
        showFullInput={showFullInput}
        setShowFullInput={setShowFullInput}
        publishedInput={publishedInput}
        setPublishedInput={setPublishedInput}
        handleApplyFilters={handleApplyFilters}
        handleCreateEvent={handleCreateEvent}
      />

      {loading ? (
        <Loader />
      ) : (
        <>
          <EventTable gridRows={gridRows} />
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

export default EventsPage;