import {
  Grid,
  Stack,
  Title,
  Box,
  Text,
  Card,
  Table,
  Modal,
  Button,
  Badge,
  Divider,
  Flex,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import React, { useContext, useEffect, useState } from 'react'
import RedeemPoints from './components/RedeemPoints'
import CreateTransaction from './components/CreateTransfer'
import { useQuery } from '@tanstack/react-query'
import { getUserInformation, getUserTransactions } from '../../utils/client'
import QRCode from 'react-qr-code'
import { NotificationContext } from '../general/Dashboard'
import { colorDict, getRelatedDetails } from './Transaction'
import { IconExternalLink } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'

function Regular() {
  const navigate = useNavigate()

  const [redeemOpened, { open: openRedeem, close: closeRedeem }] = useDisclosure(false)
  const [transferOpened, { open: openTransfer, close: closeTransfer }] = useDisclosure(false)

  const { triggerNotification } = useContext(NotificationContext)

  const { isPending, error, data } = useQuery({
    queryFn: getUserInformation,
    queryKey: ['user'],
  })

  const {
    isPending: transactionPending,
    error: transactionError,
    data: transactionData,
    refetch,
  } = useQuery({
    queryKey: ['transactions', 'recent'],
    queryFn: () => getUserTransactions(new URLSearchParams('limit=3')),
  })

  useEffect(() => {
    if (error) {
      triggerNotification(
        'Error!',
        `An error has occured while fetching user data: ${error.message}`,
        'red'
      )
    }
  }, [error])
  return (
    <>
      <Modal opened={redeemOpened} onClose={closeRedeem} title="Redeem Points" centered>
        <RedeemPoints closeModal={closeRedeem} />
      </Modal>
      <Modal opened={transferOpened} onClose={closeTransfer} title="Create a transfer" centered>
        <CreateTransaction closeModal={closeTransfer} />
      </Modal>
      <Box p={'2rem'}>
        <Stack>
          <Title>Overview</Title>
          <Grid w={'100%'}>
            <Grid.Col span={8}>
              <Card
                shadow="sm"
                p="lg"
                radius="md"
                withBorder
                bg={'black'}
                color="white"
                h={'100%'}
                pos={'relative'}>
                <Text c="white">Balance:</Text>
                <Title fz={60} c="white" style={{ textAlign: 'left' }}>
                  {data?.points}pts
                </Title>

                <Box pos={'absolute'} bottom={'0'} right={'0'} p={'lg'}>
                  <Button size="lg" fw={100} onClick={openRedeem}>
                    Redeem points
                  </Button>
                </Box>
              </Card>
            </Grid.Col>
            <Grid.Col span={2}>
              <Card shadow="sm" p="lg" radius="md" withBorder>
                <Text>Transaction QR</Text>
                {data?.id && <QRCode value={'user=' + data.id} size={'100%'} />}
              </Card>
            </Grid.Col>
            <Grid.Col span={2}>
              <Button h="100%" variant="outline" w="100%" fz={'md'} fw={100} onClick={openTransfer}>
                <Text w={'100%'} style={{ textWrap: 'wrap' }}>
                  + Make a transfer
                </Text>
              </Button>
            </Grid.Col>
          </Grid>
          <Box mt="lg">
            <Title>Recent transactions</Title>
            <Divider />
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
                {transactionData &&
                  transactionData.results.map((t) => (
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
                    </Table.Tr>
                  ))}
              </Table.Tbody>
            </Table>
            <Flex justify={'flex-end'}>
              <Button
                variant="transparent"
                rightSection={<IconExternalLink />}
                onClick={() => navigate('/regular/transaction')}
                mt="lg">
                See all transactions
              </Button>
            </Flex>
          </Box>
        </Stack>
      </Box>
    </>
  )
}

export default Regular
