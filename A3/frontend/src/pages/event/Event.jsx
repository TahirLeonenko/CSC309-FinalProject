import React from 'react';
import { Container, Title, Text, Button, Group, Paper, ThemeIcon, SimpleGrid, Grid } from '@mantine/core';
import { IconUsers, IconChartBar, IconCalendarStats, IconSettings } from '@tabler/icons-react';
import { Link, Outlet } from 'react-router-dom';
import Navbar from '../general/Navbar';

function EventDashboard() {
  return (
    <Grid w="100vw" overflow="hidden">
      <Grid.Col span={3}>
        <Navbar />
      </Grid.Col>
      <Grid.Col span={9}>
        <Outlet />
      </Grid.Col>
    </Grid>
  );
}

export default EventDashboard;