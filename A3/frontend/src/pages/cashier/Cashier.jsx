import React from 'react';
import { Container, Title, Text, Button, Group, Paper, ThemeIcon, SimpleGrid } from '@mantine/core';
import { IconUsers, IconChartBar, IconCalendarStats, IconSettings } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

function CashierDashboard() {
  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="md">Cashier Dashboard</Title>
      <Text mb="xl">
        Welcome to the Cashier portal. Use the options below to access various cashier functions.
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
                View and create new users
              </Text>
              <Button 
                component={Link} 
                to="/cashier/user" //TODO: Create cashier user page
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
                to="/cashier/transactions" //TODO: Create cashier transaction page
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

export default CashierDashboard;