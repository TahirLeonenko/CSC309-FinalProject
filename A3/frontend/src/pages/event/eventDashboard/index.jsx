import React from 'react';
import { Container, Title, Text, Button, Group, Paper, ThemeIcon, SimpleGrid } from '@mantine/core';
import { IconUsers, IconChartBar, IconCalendarStats, IconSettings } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

function EventDashboardContent() {
  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="md">Event Organizer Dashboard</Title>
      <Text mb="xl">
        Welcome to the Event Organizer portal. Use the options below to access various Event Organizer functions.
      </Text>

      <Paper shadow="md" p="xl" radius="md" withBorder>
          <Group>
            <div>
              <Title order={3}>Events</Title>
              <Text size="sm" mb="md">
                View and Manage events
              </Text>
              <Button 
                component={Link}
                to="/event-organizer/events"
                variant="outline" 
                color="orange"
              >
                Manage Events
              </Button>
            </div>
          </Group>
        </Paper>

      <SimpleGrid cols={2} spacing="lg" breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
        <Paper shadow="md" p="xl" radius="md" withBorder>
          <Group>
            <ThemeIcon size="xl" radius="md" variant="light" color="blue">
              <IconUsers size={28} />
            </ThemeIcon>
            <div>
              <Title order={3}>Guest Management</Title>
              <Text size="sm" mb="md">
                View current guests and add/remove guests
              </Text>
              <Button 
                component={Link} 
                to="/event-organizer/user-management"
                variant="filled" 
                color="blue"
              >
                Manage Users
              </Button>
            </div>
          </Group>
        </Paper>

        <Paper shadow="md" p="xl" radius="md" withBorder>
          <Group>
            <div>
              <Title order={3}>Transactions</Title>
              <Text size="sm" mb="md">
                View, Manage and Create Transactions
              </Text>
              <Button 
                component={Link}
                to="/event-organizer/transactions"
                variant="outline" 
                color="orange"
              >
                Manage Transactions
              </Button>
            </div>
          </Group>
        </Paper>
      </SimpleGrid>
    </Container>
  );
}

export default EventDashboardContent; 