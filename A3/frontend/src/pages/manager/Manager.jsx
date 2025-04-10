import React from 'react';
import { Container, Title, Text, Button, Group, Paper, ThemeIcon, SimpleGrid } from '@mantine/core';
import { IconUsers, IconChartBar, IconCalendarStats, IconSettings } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

function ManagerDashboard() {
  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="md">Manager Dashboard</Title>
      <Text mb="xl">
        Welcome to the management portal. Use the options below to access various administrative functions.
      </Text>

      <SimpleGrid cols={2} spacing="lg" breakpoints={[{ maxWidth: 'sm', cols: 1 }]}>
        <Paper shadow="md" p="xl" radius="md" withBorder>
          <Group>
            <ThemeIcon size="xl" radius="md" variant="light" color="blue">
              <IconUsers size={28} />
            </ThemeIcon>
            <div>
              <Title order={3}>User Management</Title>
              <Text size="sm" mb="md">
                View and manage user accounts, roles, and permissions
              </Text>
              <Button 
                component={Link} 
                to="/manager/user" 
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
                View and adjust all transactions
              </Text>
              <Button 
                component={Link}
                to="/manager/transactions"
                variant="outline" 
                color="orange"
              >
                View Transactions
              </Button>
            </div>
          </Group>
        </Paper>

        <Paper shadow="md" p="xl" radius="md" withBorder>
          <Group>
            <ThemeIcon size="xl" radius="md" variant="light" color="green">
              <IconCalendarStats size={28} />
            </ThemeIcon>
            <div>
              <Title order={3}>Event Management</Title>
              <Text size="sm" mb="md">
                Create and manage events
              </Text>
              <Button 
                component={Link} 
                to="/manager/events" 
                variant="outline" 
                color="green"
              >
                Manage Events
              </Button>
            </div>
          </Group>
        </Paper>

        <Paper shadow="md" p="xl" radius="md" withBorder>
          <Group>
            <div>
              <Title order={3}>Promotions</Title>
              <Text size="sm" mb="md">
                Create and manage promotions
              </Text>
              <Button 
                component={Link} 
                to="/manager/promotions" 
                variant="outline" 
                color="red"
              >
                Manage Promotions
              </Button>
            </div>
          </Group>
        </Paper>

      </SimpleGrid>
    </Container>
  );
}

export default ManagerDashboard;