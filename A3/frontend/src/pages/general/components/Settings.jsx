import React, { use, useContext, useEffect, useState } from 'react'
import {
  Tabs,
  SimpleGrid,
  TextInput,
  Title,
  LoadingOverlay,
  Flex,
  Box,
  Text,
  Avatar,
  ActionIcon,
  Button,
  Divider,
  PasswordInput,
} from '@mantine/core'
import { DateInput } from '@mantine/dates'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { changePassword, getUserInformation, patchUserInformation } from '../../../utils/client'
import { IconPencil } from '@tabler/icons-react'
import { NotificationContext } from '../Dashboard'
import Security from './Security'

function Settings({ close }) {
  const role = localStorage.getItem('role')

  const [body, setBody] = useState({})
  const [isEditing, setIsEditing] = useState(false)

  const { triggerNotification } = useContext(NotificationContext)

  const { isSuccess, isPending, error, data } = useQuery({
    queryFn: getUserInformation,
    queryKey: ['user'],
  })

  const [name, setName] = useState(data?.name)
  const [email, setEmail] = useState(data?.email)
  const [birthday, setBirthday] = useState(data?.birthday)
  const [avatarUrl, setAvatarUrl] = useState(data?.avatarUrl)

  const queryClient = useQueryClient()

  const {
    mutate,
    isPending: isSavePending,
    data: saveData,
  } = useMutation({
    mutationFn: () => patchUserInformation(body),
    onSuccess: () => {
      triggerNotification('Success!', 'Successfully edited profile information', 'green')
      close()
    },
    onError: (e) => {
      triggerNotification('Error!', `Error editing profile information: ${e.message}`, 'red')
    },
    onSettled: () => {
      queryClient.invalidateQueries(['user'])
    },
  })

  const handleCancel = () => {
    setName(data.name)
    setEmail(data.email)
    setBirthday(data.birthday)
    setAvatarUrl(data.avatarUrl)
    setIsEditing(false)
  }

  const handleSave = () => {
    setIsEditing(false)
    mutate()
  }

  useEffect(() => {
    const b = {}

    if (name !== data.name) b.name = name
    if (email !== data.email) b.email = email
    if (birthday !== data.birthday) b.birthday = birthday
    if (avatarUrl !== data.avatarUrl) b.avatarUrl = avatarUrl

    setBody(b)
  }, [name, email, birthday, avatarUrl])

  useEffect(() => {
    setName(data?.name)
    setEmail(data?.email)
    setBirthday(data?.birthday)
    setAvatarUrl(data?.avatarUrl)
  }, [isSuccess])

  return data && isSuccess ? (
    <Tabs defaultValue="profile" orientation="vertical">
      <Tabs.List>
        <Tabs.Tab value="profile">Profile Management</Tabs.Tab>
        <Tabs.Tab value="security">Security</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="profile">
        <Box pl="2rem" pr="2rem">
          <Title>Profile Management</Title>
          <Divider mt="sm" mb={'lg'} />

          <Flex justify={'flex-start'} align={'center'} gap="lg" mb={'lg'}>
            <Avatar src={avatarUrl} alt="avatar" size={'lg'} />
            <Flex direction={'column'} justify={'center'}>
              <Text fz="h4">
                <b>{data?.name}</b>
              </Text>
              <Text fz="sm" c={'gray'} pos={'relative'} top={'-6px'}>
                {role}
              </Text>
            </Flex>
          </Flex>
          <SimpleGrid cols={3} pos={'relative'}>
            {!isEditing && (
              <ActionIcon
                variant="transparent"
                pos={'absolute'}
                top="0"
                right={'-2rem'}
                onClick={() => setIsEditing(true)}>
                <IconPencil />
              </ActionIcon>
            )}
            <TextInput
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isEditing}
            />
            <TextInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!isEditing}
            />

            <DateInput
              label="Birthday"
              value={birthday}
              disabled={!isEditing}
              onChange={(e) => setBirthday(e.getDate())}
            />
            <TextInput
              label="Avatar"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e)}
              disabled={!isEditing}
            />
          </SimpleGrid>
          <Flex h="100px" justify={'flex-end'} align={'flex-end'}>
            {isEditing && (
              <Flex gap={'lg'}>
                <Button color="red" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save</Button>
              </Flex>
            )}
          </Flex>
        </Box>
      </Tabs.Panel>
      <Tabs.Panel value="security">
        <Security close={close} />
      </Tabs.Panel>
    </Tabs>
  ) : (
    <LoadingOverlay />
  )
}

export default Settings
