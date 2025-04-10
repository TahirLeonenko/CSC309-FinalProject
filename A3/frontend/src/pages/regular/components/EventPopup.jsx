import {
  Box,
  Title,
  Stack,
  Text,
  Flex,
  SimpleGrid,
  Grid,
  Divider,
  Badge,
  Button,
  LoadingOverlay,
} from '@mantine/core'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useContext, useEffect } from 'react'
import { getSingleEvent, rsvpEvent, unrsvpEvent } from '../../../utils/client'
import { IconArrowRight, IconInfoCircle } from '@tabler/icons-react'
import { NotificationContext } from '../../general/Dashboard'

function EventPopup({ eventId, close }) {
  const { triggerNotification } = useContext(NotificationContext)

  const queryClient = useQueryClient()

  const {
    isPending: isEventPending,
    error,
    data,
    refetch,
  } = useQuery({
    queryFn: () => getSingleEvent(eventId),
    queryKey: ['event', eventId],
    enabled: !!eventId,
  })

  const { mutate: mutateRsvp, isPending: isRsvpPending } = useMutation({
    mutationFn: () => rsvpEvent(eventId),
    mutationKey: ['event', eventId],
    onError: (e) => {
      triggerNotification('Error!', `Failed to RSVP: ${e.message}`, 'red')
    },
    onSuccess: (e) => {
      triggerNotification('Success!', `Successfully RSVP'd to event!`, 'green')
    },
    onSettled: () => {
      queryClient.refetchQueries({ queryKey: ['events'] })
      queryClient.refetchQueries({ queryKey: ['event'] })
    },
  })

  const { mutate: mutateUnRsvp, isPending: isUnRsvpPending } = useMutation({
    mutationFn: () => unrsvpEvent(eventId),
    mutationKey: ['event', eventId],
    onError: (e) => {
      triggerNotification('Error!', `Failed to un-RSVP: ${e.message}`, 'red')
    },
    onSuccess: (e) => {
      triggerNotification('Success!', `Successfully un-RSVP'd from event!`, 'green')
    },
    onSettled: () => {
      queryClient.refetchQueries({ queryKey: ['events'] })
      queryClient.refetchQueries({ queryKey: ['event'] })
    },
  })

  const handleClickRsvp = () => {
    mutateRsvp()
  }

  const handleClickUnRsvp = () => {
    mutateUnRsvp()
  }

  useEffect(() => {
    refetch()
  }, [eventId])

  return (
    <Box>
      <LoadingOverlay visible={isEventPending} />
      <Stack gap={'xs'}>
        <Box>
          <Flex align={'center'} justify={'flex-start'} gap={'md'}>
            <IconInfoCircle size={'2rem'} />
            <Title>{data?.name}</Title>
          </Flex>
        </Box>
        <Divider />

        <Text>
          <b>Location:</b> {data?.location}
        </Text>
        <Text>
          <b>Capacity:</b> {data?.capacity}
        </Text>
        <Text>
          <b>Guests:</b> {data?.numGuests}
        </Text>

        <Text>{data?.description}</Text>
        <Flex justify={'space-between'} mt="2rem">
          <Box>
            <Text>{data?.startTime.substring(0, 10)}</Text>
            <Title>{data?.startTime.substring(11, 16)}</Title>
          </Box>

          <IconArrowRight size={'2rem'} />
          <Box>
            <Text>{data?.endTime.substring(0, 10)}</Text>
            <Title>{data?.endTime.substring(11, 16)}</Title>
          </Box>
        </Flex>

        {data?.organizers.length > 0 && (
          <Box>
            <Text>
              <b>Organizers</b>
            </Text>
            <Divider mb={'.5rem'} />
            {data?.organizers.map((o) => (
              <Badge color="gray" key={o.id}>
                {o.name}
              </Badge>
            ))}
          </Box>
        )}

        <Flex justify={'flex-end'}>
          {data?.rsvp ? (
            <Button onClick={handleClickUnRsvp} loading={isUnRsvpPending}>
              un-RSVP
            </Button>
          ) : (
            <Button
              onClick={handleClickRsvp}
              loading={isRsvpPending}
              disabled={data?.numGuest === data?.capacity}>
              RSVP
            </Button>
          )}
        </Flex>
      </Stack>
    </Box>
  )
}

export default EventPopup
