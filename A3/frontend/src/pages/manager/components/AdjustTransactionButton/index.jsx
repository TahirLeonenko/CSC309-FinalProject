import React from 'react';
import { Button, Tooltip, ActionIcon } from '@mantine/core';
import { IconSettings, IconEdit } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

function TransactionActionButton({ tId }) {
  const navigate = useNavigate();

  const handleEditUser = () => {
    navigate(`/manager/transactions/adjust/${tId}`);
  };

  return (
    <Tooltip label="Edit Transaction">
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

export default TransactionActionButton;