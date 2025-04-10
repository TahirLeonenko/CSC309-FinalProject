import {
  Box,
  SimpleGrid,
  TextInput,
  Title,
  Select,
  Flex,
  Button,
  Table,
  Pagination,
  Center,
} from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import React, { useEffect, useState } from 'react'
import { getPromotions } from '../../utils/client'

function Promotions() {
  const [name, setName] = useState('')
  const [type, setType] = useState(null)
  const [page, setPage] = useState(1)

  const [queryParams, setQueryParams] = useState(new URLSearchParams())

  const { isPending, error, data, refetch } = useQuery({
    queryFn: () => getPromotions(queryParams),
    queryKey: ['promotions', queryParams.toString()],
  })

  const handleQuery = () => {
    const params = new URLSearchParams()
    if (name) params.append('name', name)
    if (type) params.append('type', type.toLowerCase().replace('-', ''))

    // Reset page
    setPage(1)
    params.append('page', 1)

    setQueryParams(params)
  }

  useEffect(() => {
    refetch()
  }, [queryParams])

  useEffect(() => {
    const params = new URLSearchParams(queryParams)

    params.set('page', page)

    setQueryParams(params)
  }, [page])

  return (
    <Box p="2rem">
      <Title order={1}>Promotions</Title>
      <SimpleGrid cols={4}>
        <TextInput label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Select
          label="Type"
          data={['Automatic', 'One-Time']}
          value={type}
          onChange={(e) => setType(e)}
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
              <Table.Th>Min Spending</Table.Th>
              <Table.Th>Rate</Table.Th>
              <Table.Th>Remaining Points</Table.Th>
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
                  <Table.Td>{t.minSpending}</Table.Td>
                  <Table.Td>{t.rate}</Table.Td>
                  <Table.Td>{t.points}</Table.Td>
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
  )
}

export default Promotions
