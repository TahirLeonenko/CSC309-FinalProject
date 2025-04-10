import React from 'react';
import { Button, Tooltip, ActionIcon } from '@mantine/core';
import { IconSettings, IconEdit } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

function UserActionButton({ userId }) {
  const navigate = useNavigate();

  const handleEditUser = () => {
    navigate(`/manager/user/update/${userId}`);
  };

  return (
    <Tooltip label="Edit User Settings">
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

export default UserActionButton;