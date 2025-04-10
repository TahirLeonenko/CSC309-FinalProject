import React from 'react';
import { Flex, TextInput, Select, Button, Box } from '@mantine/core';

const Filters = ({
  nameInput,
  setNameInput,
  roleInput,
  setRoleInput,
  verifiedInput,
  setVerifiedInput,
  activatedInput,
  setActivatedInput,
  sortByInput,
  setSortByInput,
  sortOrderInput,
  setSortOrderInput,
  handleApplyFilters,
}) => {
  return (
    <div className="filters-container">
      <Flex justify="space-between" align="flex-end" gap="md">
      <Flex align="center" gap="md" wrap="wrap" style={{ flex: 1 }}>
        <TextInput
          label="Search by UTORID or Name"
          placeholder="Enter search term"
          value={nameInput}
          onChange={(e) => setNameInput(e.currentTarget.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        <Select
          label="Role"
          placeholder="All roles"
          data={[
            { value: 'regular', label: 'Regular' },
            { value: 'cashier', label: 'Cashier' },
            { value: 'manager', label: 'Manager' },
          ]}
          value={roleInput}
          onChange={(value) => setRoleInput(value ?? '')}
          clearable
          style={{ flex: 1, minWidth: 120, maxWidth: 150 }}
        />
        <Select
          label="Verified"
          placeholder="Any"
          data={[
            { value: 'true', label: 'Yes' },
            { value: 'false', label: 'No' },
          ]}
          value={verifiedInput}
          onChange={(value) => setVerifiedInput(value ?? '')}
          clearable
          style={{ flex: 1, minWidth: 120, maxWidth: 150 }}
        />
        <Select
          label="Activated"
          placeholder="Any"
          data={[
            { value: 'true', label: 'Yes' },
            { value: 'false', label: 'No' },
          ]}
          value={activatedInput}
          onChange={(value) => setActivatedInput(value ?? '')}
          clearable
          style={{ flex: 1, minWidth: 120, maxWidth: 150 }}
        />
        <Select
          label="Sort By"
          placeholder="Select field"
          data={[
            { value: 'utorid', label: 'UTORID' },
            { value: 'name', label: 'Name' },
            { value: 'email', label: 'Email' },
            { value: 'role', label: 'Role' },
            { value: 'createdAt', label: 'Created At' },
            { value: 'lastLogin', label: 'Last Login' },
            { value: 'points', label: 'Points' },
          ]}
          value={sortByInput}
          onChange={(value) => setSortByInput(value ?? '')}
          clearable
          style={{ flex: 1, minWidth: 120, maxWidth: 150 }}
        />
        <Select
          label="Order"
          placeholder="Direction"
          data={[
            { value: 'asc', label: 'Asc' },
            { value: 'desc', label: 'Desc' },
          ]}
          value={sortOrderInput}
          onChange={(value) => setSortOrderInput(value ?? '')}
          clearable
          style={{ flex: 1, minWidth: 120, maxWidth: 150 }}
        />
        </Flex>
        <Box ml="md" style={{ display: 'flex', alignItems: 'flex-end' }}>
          <Button onClick={handleApplyFilters} size="md">Apply Filters</Button>
        </Box>
      </Flex>
    </div>
  );
};

export default Filters;
