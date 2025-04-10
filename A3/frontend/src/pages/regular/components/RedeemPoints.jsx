import { NumberInput, SimpleGrid, TextInput, Stack, Button, Flex } from '@mantine/core'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import React, { useContext, useState } from 'react'
import { createRedemption } from '../../../utils/client'
import { NotificationContext } from '../../general/Dashboard'

function RedeemPoints({ closeModal }) {
  const [amount, setAmount] = useState(0)
  const [remark, setRemark] = useState('')

  const queryClient = useQueryClient()

  const { triggerNotification } = useContext(NotificationContext)

  const redemptionMutation = useMutation({
    mutationFn: () => createRedemption(amount, remark),
    onError: (e) => {
      triggerNotification('Error!', `Failed to create redemption transaction: ${e.message}`, 'red')
    },
    onSuccess: () => {
      triggerNotification(
        'Success!',
        `Succesfully created redemption transaction with amount ${amount}`,
        'green'
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })

  const handleRedeemPoints = () => {
    redemptionMutation.mutate()
    closeModal()
  }

  return (
    <Stack>
      <SimpleGrid cols={2}>
        <NumberInput
          label="Amount"
          required
          value={amount}
          onChange={(e) => setAmount(parseInt(e))}
        />
        <TextInput label="Remark" value={remark} onChange={(e) => setRemark(e.target.value)} />
      </SimpleGrid>
      <Flex w="100%" justify={'flex-end'}>
        <Button onClick={handleRedeemPoints}>Save</Button>
      </Flex>
    </Stack>
  )
}

export default RedeemPoints
