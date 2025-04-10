import React from 'react';
import { Button, Tooltip, ActionIcon } from '@mantine/core';
import { IconSettings, IconEdit } from '@tabler/icons-react';
import { addOrganizer, removeOrganizer, addGuest, removeGuest } from '../../editEvent/eventActions.jsx';

export function AddOrganizerButton({ eventId, utorid, setError, currentPath, navigate, setOrga }) {
  return (
    <Tooltip label="Add Organizer">
      <ActionIcon 
        color="blue" 
        size="lg" 
        variant="light"
        onClick={() => addOrganizer(eventId, utorid, setError, currentPath, navigate, setOrga)}
      >
        <IconEdit size={18} />
      </ActionIcon>
    </Tooltip>
  );
}

export function RemoveOrganizerButton({ eventId, userId, setError, currentPath, navigate, setOrga }) {
  return (
    <Tooltip label="Remove Organizer">
      <ActionIcon 
        color="red" 
        size="lg" 
        variant="light"
        onClick={() => removeOrganizer(eventId, userId, setError, currentPath, navigate, setOrga)}
      >
        <IconEdit size={18} />
      </ActionIcon>
    </Tooltip>
  );
}

export function AddGuestButton({ eventId, utorid, setError, currentPath, navigate, setGuests }) {
  return (
    <Tooltip label="Add Guest">
      <ActionIcon 
        color="blue" 
        size="lg" 
        variant="light"
        onClick={() => addGuest(eventId, utorid, setError, currentPath, navigate, setGuests)}
      >
        <IconEdit size={18} />
      </ActionIcon>
    </Tooltip>
  );
}

export function RemoveGuestButton({ eventId, userId, setError, currentPath, navigate, setGuests }) {
  return (
    <Tooltip label="Remove Guest">
      <ActionIcon 
        color="red" 
        size="lg" 
        variant="light"
        onClick={() => removeGuest(eventId, userId, setError, currentPath, navigate, setGuests)}
      >
        <IconEdit size={18} />
      </ActionIcon>
    </Tooltip>
  );
}

