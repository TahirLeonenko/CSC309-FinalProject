import { Stack, SimpleGrid, NumberInput, TextInput, Flex, Button } from '@mantine/core'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useContext, useState } from 'react'
import { createTransfer } from '../../../utils/client'
import { NotificationContext } from '../../general/Dashboard'

function CreateTransfer({ closeModal }) {
  const [userId, setUserId] = useState(null)
  const [amount, setAmount] = useState(0)
  const [remark, setRemark] = useState('')

  const { triggerNotification } = useContext(NotificationContext)

  const queryClient = useQueryClient()

  const transferMutation = useMutation({
    mutationFn: () => createTransfer(userId, amount, remark),
    onError: (e) => {
      triggerNotification('Error!', e.message, 'red')
    },
    onSuccess: (d) => {
      triggerNotification(
        'Success!',
        `Successfully completed transfer to user with id: ${userId}`,
        'green'
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })

  const handleCreateTransfer = () => {
    closeModal()
    transferMutation.mutate()
  }

  return (
    <Stack>
      <SimpleGrid cols={2}>
        <NumberInput
          label="User ID"
          required
          value={userId}
          onChange={(e) => setUserId(parseInt(e))}
        />
        <NumberInput
          label="Amount"
          required
          value={amount}
          onChange={(e) => setAmount(parseInt(e))}
        />
        <TextInput label="Remark" value={remark} onChange={(e) => setRemark(e.target.value)} />
      </SimpleGrid>
      <Flex w="100%" justify={'flex-end'}>
        <Button onClick={handleCreateTransfer}>Save</Button>
      </Flex>
    </Stack>
  )
}

export default CreateTransfer
