import {
  Modal,
  Button,
  Box,
  Title,
  SimpleGrid,
  TextInput,
  Select,
  Flex,
  Table,
  Center,
  Pagination,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import React, { use, useEffect, useState } from 'react'
import EventPopup from './components/EventPopup'
import { useQuery } from '@tanstack/react-query'
import { getEvents } from '../../utils/client'
import { IconDotsVertical } from '@tabler/icons-react'

function Events() {
  const [isDetailOpen, { open, close }] = useDisclosure()
  const [detailEventId, setDetailEventId] = useState(null)

  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [started, setStarted] = useState(null)
  const [ended, setEnded] = useState(null)
  const [showFull, setShowFull] = useState(false)

  const [page, setPage] = useState(1)

  const [queryParams, setQueryParams] = useState(new URLSearchParams())

  const handleShowDetail = (id) => {
    setDetailEventId(id)
    open()
  }

  const handleQuery = () => {
    const params = new URLSearchParams()

    if (name) params.append('name', name)
    if (location) params.append('location', location)
    if (started) params.append('started', started === 'Yes')
    if (ended) params.append('ended', ended === 'Yes')
    if (showFull) params.append('showFull', showFull === 'Yes')

    setQueryParams(params)
  }

  const { isPending, error, data, refetch } = useQuery({
    queryFn: () => getEvents(queryParams),
    queryKey: ['events', queryParams.toString()],
  })

  useEffect(() => {
    const params = new URLSearchParams(queryParams)

    if (page) params.append('page', page)

    setQueryParams(params)
  }, [page])

  useEffect(() => {
    refetch()
  }, [queryParams])

  return (
    <>
      <Modal opened={isDetailOpen} onClose={close} centered>
        <EventPopup eventId={detailEventId} />
      </Modal>
      <Box p="2rem">
        <Title order={1}>Events</Title>
        <SimpleGrid cols={4}>
          <TextInput label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <TextInput
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <Select
            label="Started"
            data={['Yes', 'No']}
            value={started}
            onChange={(e) => setStarted(e)}
          />
          <Select label="Ended" data={['Yes', 'No']} value={ended} onChange={(e) => setEnded(e)} />
          <Select
            label="Show Full"
            data={['Yes', 'No']}
            value={showFull}
            onChange={(e) => setShowFull(e)}
          />
        </SimpleGrid>
        <Flex mt="1rem" justify={'end'}>
          <Button onClick={handleQuery}>Apply Filters</Button>
        </Flex>
        <Box h="60vh">
          <Table mt={'2rem'} highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>ID</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th>Start Time</Table.Th>
                <Table.Th>End Time</Table.Th>
                <Table.Th>Capacity</Table.Th>
                <Table.Th>Guests</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data &&
                data.results.map((t) => (
                  <Table.Tr key={t.id}>
                    <Table.Td>{t.id}</Table.Td>
                    <Table.Td>{t.name}</Table.Td>
                    <Table.Td>{t.startTime.substring(0, 19).replace('T', ' ')}</Table.Td>
                    <Table.Td>{t.endTime.substring(0, 19).replace('T', ' ')}</Table.Td>
                    <Table.Td>{t.capacity}</Table.Td>
                    <Table.Td>{t.numGuests}</Table.Td>
                    <Table.Td>
                      <Button variant="transparent">
                        <IconDotsVertical onClick={() => handleShowDetail(t.id)} />
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
            </Table.Tbody>
          </Table>
        </Box>

        <Center mt="lg">
          {data && (
            <Pagination total={parseInt(data.count / 10) + 1} value={page} onChange={setPage} />
          )}
        </Center>
      </Box>
    </>
  )
}

export default Events
