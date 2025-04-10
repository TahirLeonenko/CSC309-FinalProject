import {
  Table,
  Box,
  Badge,
  Title,
  Center,
  SimpleGrid,
  Select,
  Button,
  Flex,
  Pagination,
  NumberInput,
  Container,
  Modal,
  ActionIcon,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import React, { useEffect, useState } from 'react'
import { getUserTransactions } from '../../utils/client'
import { useQuery } from '@tanstack/react-query'
import AmountSelector from './components/AmountSelector'
import ProcessRedemption from './components/ProcessRedemption'
import { IconDotsVertical } from '@tabler/icons-react'

export const colorDict = {
  purchase: 'blue',
  redemption: 'green',
  transfer: 'yellow',
  adjustment: 'red',
  event: 'gray',
}

export const getRelatedDetails = (transaction) => {
  if (!transaction.relatedId) {
    return ''
  }

  switch (transaction.type) {
    case 'adjustment':
      return `Transaction ID adjusted: ${transaction.relatedId}`
    case 'transfer':
      if (transaction.amount < 0) {
        return `Transaction sent to user ${transaction.relatedId}`
      } else {
        return `Transaction received from user ${transaction.relatedId}`
      }
    case 'redemption':
      return `Redemption processed by cashier id: ${transaction.relatedId}`
    case 'event':
      return `Event id: ${transaction.relatedId}`
    default:
      return ''
  }
}

function Transaction() {
  const [promotionId, setPromotionId] = useState('')
  const [type, setType] = useState(null)
  const [relatedId, setRelatedId] = useState('')
  const [operator, setOperator] = useState('')
  const [amount, setAmount] = useState(0)

  const [queryParams, setQueryParams] = useState(new URLSearchParams())

  const [processRedemptionOpen, { open, close }] = useDisclosure(false)
  const [redemptionTransaction, setRedemptionTransaction] = useState(null)

  const handleClickRedemption = (t) => {
    setRedemptionTransaction(t)
    open()
  }

  // Pagination variables
  const [page, setPage] = useState(1)

  const { isPending, error, data, refetch } = useQuery({
    queryKey: ['transactions', page, queryParams.toString()],
    queryFn: () => getUserTransactions(queryParams),
  })

  const handleQuery = () => {
    const params = new URLSearchParams()

    if (type) params.append('type', type)
    if (promotionId) params.append('promotionId', promotionId)
    if (relatedId && type) params.append('relatedId', relatedId)
    if (operator && amount) {
      params.append('operator', operator === '<=' ? 'lte' : 'gte')
      params.append('amount', amount)
    }

    // Reset page
    setPage(1)
    params.append('page', 1)

    setQueryParams(params)
  }

  useEffect(() => {
    const params = new URLSearchParams(queryParams)

    if (page) params.set('page', page)

    setQueryParams(params)
  }, [page])

  useEffect(() => {
    refetch()
  }, [queryParams])

  return (
    <>
      <Modal opened={processRedemptionOpen} onClose={close} title="Process Redemption" centered>
        <ProcessRedemption transaction={redemptionTransaction} />
      </Modal>
      <Box p="2rem" h="90vh" w="100%">
        <Title order={1}>Transactions</Title>
        <SimpleGrid cols={4}>
          <NumberInput
            label="Promotion ID"
            value={promotionId}
            onChange={(e) => setPromotionId(e.target.value)}
            hideControls
          />
          <Select
            label="Type"
            data={['Purchase', 'Adjustment', 'Redemption', 'Transfer', 'Event']}
            value={type}
            onChange={(e) => setType(e)}
          />
          <NumberInput
            label="Related ID"
            disabled={!type}
            value={relatedId}
            onChange={(e) => setRelatedId(parseInt(e))}
            hideControls
          />
          <AmountSelector
            amount={amount}
            setAmount={setAmount}
            operator={operator}
            setOperator={setOperator}
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
                <Table.Th>Created By</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Spent</Table.Th>
                <Table.Th>Amount</Table.Th>
                <Table.Th>Remark</Table.Th>
                <Table.Th>Related Details</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data &&
                data.results.map((t) => (
                  <Table.Tr key={t.id}>
                    <Table.Td>{t.id}</Table.Td>
                    <Table.Td>{t.createdBy}</Table.Td>
                    <Table.Td>
                      <Badge color={colorDict[t.type]}>{t.type}</Badge>
                    </Table.Td>
                    <Table.Td>{t.spent}</Table.Td>
                    <Table.Td>{t.amount}</Table.Td>
                    <Table.Td>{t.remark}</Table.Td>
                    <Table.Td>{getRelatedDetails(t)}</Table.Td>
                    <Table.Td>
                      {t.type === 'redemption' && (
                        <ActionIcon
                          variant="transparent"
                          aria-label="details"
                          onClick={() => handleClickRedemption(t)}>
                          <IconDotsVertical />
                        </ActionIcon>
                      )}
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

export default Transaction
