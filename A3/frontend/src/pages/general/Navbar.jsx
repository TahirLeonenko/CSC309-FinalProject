import React from 'react'

import {
  Stack,
  Title,
  Flex,
  Card,
  Button,
  ActionIcon,
  Tooltip,
  Modal,
  SimpleGrid,
  Tabs,
  Box,
  TextInput,
  Divider,
} from '@mantine/core'
import { useNavigate } from 'react-router'
import { roleToClearance } from '../../utils/utils'
import { IconSettings } from '@tabler/icons-react'
import Settings from './components/Settings'
import { useDisclosure } from '@mantine/hooks'

function Navbar() {
  const navigate = useNavigate()

  const [opened, { open, close }] = useDisclosure()

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('role')
    localStorage.removeItem('userid')
    navigate('/login')
  }

  const role = localStorage.getItem('role')
  const clearance = roleToClearance[role]

  const clearanceToLinks = {
    1: [
      {
        label: 'Dashboard',
        to: '/regular',
      },
      {
        label: 'Event Organizer',
        to: '/event-organizer',
      },
    ],
    2: [
      {
        label: 'Dashboard',
        to: '/cashier',
      },
      {
        label: 'Regular User Dashboard',
        to: '/regular',
      },
      {
        label: 'Event Organizer',
        to: '/event-organizer',
      },
    ],

    3: [
      {
        label: 'Dashboard',
        to: '/manager',
      },
      {
        label: 'Cashier Dashboard',
        to: '/cashier',
      },
      {
        label: 'Regular User Dashboard',
        to: '/regular',
      },

      {
        label: 'Event Organizer',
        to: '/event-organizer',
      },
    ],
    4: [
      {
        label: 'Dashboard',
        to: '/manager',
      },
      {
        label: 'Cashier Dashboard',
        to: '/cashier',
      },
      {
        label: 'Regular User Dashboard',
        to: '/regular',
      },
      {
        label: 'Event Organizer',
        to: '/event-organizer',
      },
    ],
  }

  const generalLinks = [
    {
      label: 'Transactions',
      to: clearance <= 2 ? '/regular/transaction' : '/manager/transactions',
    },
    { label: 'Events', to: clearance <= 2 ? '/regular/events' : '/manager/events' },
    { label: 'Promotions', to: clearance <= 2 ? '/regular/promotions' : '/manager/promotions' },
  ]

  const navLink = (to, label) => (
    <Button
      variant="outline"
      fw={'bold'}
      onClick={() => navigate(to)}
      styles={{
        inner: {
          justifyContent: 'flex-start',
        },
      }}>
      {label}
    </Button>
  )

  return (
    <>
      <Modal opened={opened} onClose={close} title="Settings" size={'60vw'}>
        <Settings close={close} />
      </Modal>
      <Card bg={'black'} h={'90vh'} w="100%" m="xl" pos={'relative'} top={0} left={0}>
        <Flex justify="space-between" h="100%" direction="column">
          <Flex justify={'space-between'}>
            <Title fw={'bold'} c="white">
              Logo
            </Title>
            <Tooltip label="settings">
              <ActionIcon size={'input-md'} onClick={open}>
                <IconSettings />
              </ActionIcon>
            </Tooltip>
          </Flex>

          <Flex justify={'center'} direction="column" gap={'lg'}>
            <Flex justify={'center'} direction="column">
              <Title c="white">Roles</Title>
              <Divider mb="lg" />
              <Stack gap={'xs'} w={'100%'}>
                {clearanceToLinks[clearance] &&
                  clearanceToLinks[clearance].map((l) => navLink(l.to, l.label))}
              </Stack>
            </Flex>

            <Flex justify={'center'} direction="column">
              <Title c="white">General</Title>
              <Divider mb="lg" />

              <Stack gap={'xs'} w={'100%'}>
                {generalLinks.map((l) => navLink(l.to, l.label))}
              </Stack>
            </Flex>
          </Flex>

          <Button onClick={handleLogout}>Log out</Button>
        </Flex>
      </Card>
    </>
  )
}

export default Navbar
