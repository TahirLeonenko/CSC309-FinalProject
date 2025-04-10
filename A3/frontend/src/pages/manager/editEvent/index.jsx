import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  TextInput,
  Switch,
  Button,
  Paper,
  Title,
  Notification,
  LoadingOverlay,
  Group,
  Container,
  SimpleGrid,
  Pagination,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import GuestTable from '../components/tables/guestTable';
import fetchUsers from '../user/fetchUser';
import Filters from '../components/filters/user';
import {
  AddOrganizerButton,
  RemoveOrganizerButton,
  AddGuestButton,
  RemoveGuestButton,
} from '../components/eventButtons';
import './styles.css';

function EditEventPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const itemsPerPage = 5;

  // hooks for event data
  const [eventData, setEventData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [capacity, setCapacity] = useState('');
  const [published, setPublished] = useState(false);


  // hooks for guests and organizers
  const [guests, setGuests] = useState([]);
  const [orga, setOrga] = useState([]); 
  const [guestPage, setGuestPage] = useState(1);
  const [orgaPage, setOrgaPage] = useState(1);
  const [paginatedGuests, setPaginatedGuests] = useState([]);
  const [paginatedOrganizers, setPaginatedOrganizers] = useState([]);

  // hooks for users
  const [showUsers, setShowUsers] = useState(false);
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

  useEffect(() => {
    fetchEventData();
  }, [eventId]);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3000/events/${eventId}`, {
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
            navigate(`/login?returnTo=/manager/event/edit/${eventId}`, { replace: true });
            return;
          case 403:
            throw new Error('You do not have permission to manage events.');
          case 404:
            throw new Error('Event not found');
          default:
            throw new Error(`Error ${res.status}: ${errorData.error || 'Unknown error'}`);
        }
      }

      const data = await res.json();
      setEventData(data);
      setName(data.name);
      setLocation(data.location);
      setStartTime(new Date(data.startTime));
      setEndTime(new Date(data.endTime));
      setCapacity(data.capacity?.toString() || '');
      setPublished(data.published ?? false);
      setOrga(data.organizers || []); // Assuming organizers data is part of the event data
      setGuests(data.guests || []); // Assuming guests data is part of the event data
    } catch (err) {
      console.error('Error fetching event data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEvent = async () => {
    if (!eventData) {
      setError('No event data to update. Fetch an event first.');
      return;
    }

    const updatedFields = {};
    if (name !== eventData.name) updatedFields.name = name;
    if (location !== eventData.location) updatedFields.location = location;
    
    if (startTime && startTime.toISOString() !== eventData.startTime) 
      updatedFields.startTime = startTime.toISOString();
    if (endTime && endTime.toISOString() !== eventData.endTime) 
      updatedFields.endTime = endTime.toISOString();
    
    if (capacity && Number(capacity) !== eventData.capacity) updatedFields.capacity = Number(capacity) || null;
    if (published !== eventData.published) updatedFields.published = published;

    if (Object.keys(updatedFields).length === 0) {
      setError('No changes made to event details');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:3000/events/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(updatedFields),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update event');
      }

      const updated = await res.json();
      setEventData((prev) => ({ ...prev, ...updated }));
      alert('Event updated successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Paginate guests
  useEffect(() => {
    const startIndex = (guestPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedGuests(guests.slice(startIndex, endIndex));
  }, [guestPage, guests]);

  // Paginate organizers
  useEffect(() => {
    const startIndex = (orgaPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedOrganizers(orga.slice(startIndex, endIndex));
  }, [orgaPage, orga]);

  const guestsRows = paginatedGuests.map((guest, index) => (
    <div
      key={guest.id}
      className={`guest grid-row ${index % 2 === 0 ? 'even' : ''}`}
    >
      <div className="grid-cell">{guest.id}</div>
      <div className="grid-cell">{guest.utorid}</div>
      <div className="grid-cell">{guest.name}</div>
      <div className='grid-cell'>
        <RemoveGuestButton 
          userId={guest.id}
          utorid={guest.utorid}
          eventId={eventId} 
          setGuests={setGuests} 
          setError={setError}
          currentPath={`/events/edit/${eventId}`}
          navigate={navigate}
        />
      </div>
    </div>
  ));

  const organizerRows = paginatedOrganizers.map((user, index) => (
    <div
      key={user.id}
      className={`guest grid-row ${index % 2 === 0 ? 'even' : ''}`}
    >
      <div className="grid-cell">{user.id}</div>
      <div className="grid-cell">{user.utorid}</div>
      <div className="grid-cell">{user.name}</div>
      <div className='grid-cell'>
        <RemoveOrganizerButton
          userId={user.id}
          eventId={eventId}
          setOrga={setOrga}
          setError={setError}
          currentPath={`/events/edit/${eventId}`}
          navigate={navigate}
        />
      </div>
    </div>
  ));

  // Fetch/Paginate users
  useEffect(() => {
    fetchUsers(queryParams, setUsers, setTotalCount, setLoading, setError, `/events/edit/${eventId}`, navigate);
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
  const handleShowUsers = () => {
    setShowUsers((prev) => !prev);
  };
  const UserPageChange = (newPage) => {
    setQueryParams((prev) => ({ ...prev, page: newPage }));
  };

  const guestButtion = (user) => {
    const isGuest = guests.some((guest) => guest.utorid === user.utorid);
    return isGuest ? (
      <RemoveGuestButton 
        userId={user.id}
        utorid={user.utorid}
        eventId={eventId} 
        setGuests={setGuests} 
        setError={setError}
        currentPath={`/events/edit/${eventId}`}
        navigate={navigate}
      />
    ) : (
      <AddGuestButton
        utorid={user.utorid}
        eventId={eventId}
        setGuests={setGuests}
        setError={setError}
        currentPath={`/events/edit/${eventId}`}
        navigate={navigate}
      />
    );
  };

  const organizerButton = (user) => {
    const isOrganizer = orga.some((organizer) => organizer.utorid === user.utorid);
    return isOrganizer ? (
      <RemoveOrganizerButton
        userId={user.id}
        eventId={eventId}
        setOrga={setOrga}
        setError={setError}
        currentPath={`/events/edit/${eventId}`}
        navigate={navigate}
      />
    ) : (
      <AddOrganizerButton
        utorid={user.utorid}
        eventId={eventId}
        setOrga={setOrga}
        setError={setError}
        currentPath={`/events/edit/${eventId}`}
        navigate={navigate}
      />
    );
  };

  const userRows = users.map((user, index) => (
    <div
      key={user.id}
      className={`user event grid-row ${index % 2 === 0 ? 'even' : ''}`}
    >
      <div className="grid-cell">{user.utorid}</div>
      <div className="grid-cell">{user.name}</div>
      <div className="grid-cell">{user.role}</div>
      <div className="grid-cell">{user.verified ? 'Yes' : 'No'}</div>
      <div className="grid-cell">
        {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
      </div>
      <div className="grid-cell">
        {guestButtion(user)}
      </div>
      <div className="grid-cell">
        {organizerButton(user)}
      </div>
    </div>
  ));


  return (
    <Container my="md">
      <h1>Edit Event</h1>

      {error && (
        <Notification color="red" mb="md" onClose={() => setError('')}>
          {error}
        </Notification>
      )}

      {eventData && (
        <Container p={0}>
        <SimpleGrid cols={1} spacing="lg" breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
          {/* Event info */}
          <Paper shadow="xs" p="md" mb="lg" style={{ position: 'relative' }}>
            <LoadingOverlay visible={loading} />
            <div className="user-table row">
              <div className="user-row">
                <div className="user-label">Event ID</div>
                <div className="user-value">{eventData.id}</div>
              </div>
              <div className="user-row">
                <div className="user-label">Name</div>
                <div className="user-value">{eventData.name}</div>
              </div>
              <div className="user-row">
                <div className="user-label">Location</div>
                <div className="user-value">{eventData.location}</div>
              </div>
              <div className="user-row">
                <div className="user-label">Start Time</div>
                <div className="user-value">{new Date(eventData.startTime).toLocaleString({dateStyle: 'short', timeStyle: 'short'})}</div>
              </div>
              <div className="user-row">
                <div className="user-label">End Time</div>
                <div className="user-value">{new Date(eventData.endTime).toLocaleString({dateStyle: 'short', timeStyle: 'short'})}</div>
              </div>
              <div className="user-row">
                <div className="user-label">Capacity</div>
                <div className="user-value">{eventData.capacity || '-'}</div>
              </div>
              <div className="user-row">
                <div className="user-label">Guests</div>
                <div className="user-value">{eventData.numGuests || 0}</div>
              </div>
              <div className="user-row">
                <div className="user-label">Published</div>
                <div className="user-value">{eventData.published ? 'Yes' : 'No'}</div>
              </div>
            </div>
          </Paper>

          <Paper shadow="xs" p="md" mb="lg" style={{ position: 'relative' }}>
            <Box mt="md">
              <Title order={4} mb="sm">
                Edit Event Details
              </Title>
              <TextInput
                label="Name"
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
                mb="sm"
                className="form-field-medium"
              />
              <TextInput
                label="Location"
                value={location}
                onChange={(e) => setLocation(e.currentTarget.value)}
                mb="sm"
                className="form-field-medium"
              />
              <DateTimePicker
                label="Start Time"
                value={startTime}
                onChange={setStartTime}
                mb="sm"
                className="form-field-medium"
              />
              <DateTimePicker
                label="End Time"
                value={endTime}
                onChange={setEndTime}
                mb="sm"
                className="form-field-medium"
              />
              <TextInput
                label="Capacity"
                value={capacity}
                onChange={(e) => setCapacity(e.currentTarget.value)}
                mb="sm"
                className="form-field-medium"
              />
              <Switch
                label="Published"
                checked={published}
                onChange={(event) => setPublished(event.currentTarget.checked)}
                mb="sm"
                className="form-field-small"
              />
              <Group position="right">
                <Button onClick={handleUpdateEvent}>Update Event</Button>
                <Button onClick={handleShowUsers}>
                  {showUsers ? 'Hide Users' : 'Show Users'}
                </Button>
              </Group>
            </Box>
          </Paper>
        </SimpleGrid>
        <SimpleGrid cols={2} spacing="lg" breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
          <Paper shadow="xs" p="md" mb="lg" style={{ position: 'relative' }}>
            <h1>Guests: {guests.length}</h1>
            <GuestTable gridRows={guestsRows}/>
            <Group position="center" mt="md">
              <Pagination
                value={guestPage}
                onChange={setGuestPage}
                total={Math.ceil(guests.length / itemsPerPage)}
              />
            </Group>
          </Paper>
          <Paper shadow="xs" p="md" mb="lg" style={{ position: 'relative' }}>
            <h1>Organizers: {orga.length}</h1>
            <GuestTable gridRows={organizerRows}/>
            <Group position="center" mt="md">
              <Pagination
                value={orgaPage}
                onChange={setOrgaPage}
                total={Math.ceil(orga.length / itemsPerPage)}
              />
            </Group>
          </Paper>
        </SimpleGrid>
        {showUsers && (
        <SimpleGrid cols={1} spacing="lg" breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
          <Paper shadow="xs" p="md" mb="lg" style={{ position: 'relative' }}>
            <h1>Users</h1>
            <div className="grid-table">
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
            {/* Header Row */}
            <div className="user event grid-row header">
              <div className="grid-cell">UTORID</div>
              <div className="grid-cell">Name</div>
              <div className="grid-cell">Role</div>
              <div className="grid-cell">Verified</div>
              <div className="grid-cell">Last Login</div>
              <div className="grid-cell">Add/Remove Guest</div>
              <div className="grid-cell">Add/Remove Organizer</div>
            </div>
            {/* Data Rows */}
            {userRows}
          </div>
            <Group position="center" mt="md">
              <Pagination
                value={queryParams.page}
                onChange={UserPageChange}
                total={Math.ceil(totalCount / queryParams.limit)}
              />
            </Group>
          </Paper>
        </SimpleGrid> )}
        </Container>  
      )}
    </Container>
    
  );
}

export default EditEventPage;