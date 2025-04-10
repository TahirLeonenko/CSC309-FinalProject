import React from 'react';
import { Button, Tooltip, ActionIcon } from '@mantine/core';
import { IconSettings, IconEdit } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

function EditEventButton({ eventId }) {
  const navigate = useNavigate();

  const handleEditUser = () => {
    navigate(`/manager/events/edit/${eventId}`);
  };

  return (
    <Tooltip label="Edit Event">
      <ActionIcon 
        color="blue" 
        size="lg" 
        variant="light"
        onClick={handleEditUser}
      >
        <IconSettings size={18} />
      </ActionIcon>
    </Tooltip>
  );
}

export default EditEventButton;