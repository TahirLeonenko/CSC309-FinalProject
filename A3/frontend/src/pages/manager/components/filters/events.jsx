import React from 'react';
import { Flex, TextInput, Select, Button, Box } from '@mantine/core';

const EventsFilters = ({
  nameInput,
  setNameInput,
  locationInput,
  setLocationInput,
  startedInput,
  setStartedInput,
  endedInput,
  setEndedInput,
  showFullInput,
  setShowFullInput,
  publishedInput,
  setPublishedInput,
  handleApplyFilters,
  handleCreateEvent,
}) => {
  return (
    <div className="filters-container">
      <Flex justify="space-between" align="flex-end" gap="md">
        <Flex align="center" gap="md" wrap="wrap" style={{ flex: 1 }}>
          <TextInput
            label="Search by Name"
            placeholder="Enter event name"
            value={nameInput}
            onChange={(e) => setNameInput(e.currentTarget.value)}
            style={{ flex: 1, minWidth: 200 }}
          />

          <TextInput
            label="Location"
            placeholder="Enter location"
            value={locationInput}
            onChange={(e) => setLocationInput(e.currentTarget.value)}
            style={{ flex: 1, minWidth: 200 }}
          />

          <Select
            label="Started"
            placeholder="Any"
            data={[
              { value: 'true', label: 'Yes' },
              { value: 'false', label: 'No' },
            ]}
            value={startedInput}
            onChange={(value) => setStartedInput(value ?? '')}
            clearable
            style={{ flex: 1, minWidth: 120, maxWidth: 150 }}
          />

          <Select
            label="Ended"
            placeholder="Any"
            data={[
              { value: 'true', label: 'Yes' },
              { value: 'false', label: 'No' },
            ]}
            value={endedInput}
            onChange={(value) => setEndedInput(value ?? '')}
            clearable
            style={{ flex: 1, minWidth: 120, maxWidth: 150 }}
          />

          <Select
            label="Show Full"
            placeholder="Any"
            data={[
              { value: 'true', label: 'Yes' },
              { value: 'false', label: 'No' },
            ]}
            value={showFullInput}
            onChange={(value) => setShowFullInput(value ?? '')}
            clearable
            style={{ flex: 1, minWidth: 120, maxWidth: 150 }}
          />

          <Select
            label="Published"
            placeholder="Any"
            data={[
              { value: 'true', label: 'Yes' },
              { value: 'false', label: 'No' },
            ]}
            value={publishedInput}
            onChange={(value) => setPublishedInput(value ?? '')}
            clearable
            style={{ flex: 1, minWidth: 120, maxWidth: 150 }}
          />
        </Flex>

        <Box ml="md" style={{ display: 'flex', alignItems: 'flex-end', flexDirection: 'column', gap: '0.5rem' }}>
          <Button onClick={handleApplyFilters} size="md">Apply Filters</Button>
          <Button onClick={handleCreateEvent} size="md" variant="outline">Create Event</Button>
        </Box>
      </Flex>
    </div>
  );
};

export default EventsFilters;