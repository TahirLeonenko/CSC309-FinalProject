import { useState, useContext } from 'react'
import { changePassword } from '../../../utils/client'
import {
  SimpleGrid,
  Title,
  Flex,
  Box,
  Button,
  Divider,
  PasswordInput,
  Popover,
  Text,
} from '@mantine/core'
import { NotificationContext } from '../Dashboard'
import { useMutation } from '@tanstack/react-query'

import { IconCheck, IconX } from '@tabler/icons-react'

function PasswordRequirement({ meets, label }) {
  return (
    <Text
      c={meets ? 'teal' : 'red'}
      style={{ display: 'flex', alignItems: 'center' }}
      mt={7}
      size="sm">
      {meets ? <IconCheck size={14} /> : <IconX size={14} />}
      <Box ml={10}>{label}</Box>
    </Text>
  )
}

function Security({ close }) {
  const [oldPassword, setOldPassword] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const { triggerNotification } = useContext(NotificationContext)

  const [popoverOpened, setPopoverOpened] = useState(false)
  const [confirmPopoverOpened, setConfirmPopoverOpened] = useState(false)

  const {
    mutate: mutatePassword,
    isPending: isPasswordPending,
    data: passwordData,
  } = useMutation({
    mutationFn: () => changePassword(oldPassword, password),
    onSuccess: () => {
      triggerNotification('Success!', 'Successfully changed password', 'green')
      close()
    },
    onError: (e) => {
      triggerNotification('Error!', `Error changing password: ${e.message}`, 'red')
    },
  })

  const requirements = [
    { re: /[0-9]/, label: 'Includes number' },
    { re: /[a-z]/, label: 'Includes lowercase letter' },
    { re: /[A-Z]/, label: 'Includes uppercase letter' },
    { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'Includes special character' },
    { re: /^.{8,20}$/, label: 'Includes between 8 and 20 characters' },
  ]

  const checks = requirements.map((requirement, index) => (
    <PasswordRequirement
      key={index}
      label={requirement.label}
      meets={requirement.re.test(password)}
    />
  ))

  const handlePasswordSave = () => {
    mutatePassword()
  }

  return (
    <Box pl="2rem" pr="2rem">
      <Title>Security</Title>
      <Divider mt="sm" mb={'lg'} />
      <Title order={3}>Change password</Title>
      <SimpleGrid cols={2} mt="xs">
        <PasswordInput
          label="Old Password"
          withAsterisk
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
        <Popover
          opened={popoverOpened}
          position="bottom"
          width="target"
          transitionProps={{ transition: 'pop' }}>
          <Popover.Target>
            <div
              onFocusCapture={() => setPopoverOpened(true)}
              onBlurCapture={() => setPopoverOpened(false)}>
              <PasswordInput
                withAsterisk
                label="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </Popover.Target>
          <Popover.Dropdown>{checks}</Popover.Dropdown>
        </Popover>

        <Popover
          opened={confirmPopoverOpened}
          position="bottom"
          width="target"
          transitionProps={{ transition: 'pop' }}>
          <Popover.Target>
            <div
              onFocusCapture={() => setConfirmPopoverOpened(true)}
              onBlurCapture={() => setConfirmPopoverOpened(false)}>
              <PasswordInput
                withAsterisk
                label="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </Popover.Target>
          <Popover.Dropdown>
            <PasswordRequirement
              label={'Is equal to password'}
              meets={password === confirmPassword}
            />
          </Popover.Dropdown>
        </Popover>
      </SimpleGrid>
      <Flex h="100px" justify={'flex-end'} align={'flex-end'}>
        <Flex gap={'lg'}>
          <Button onClick={handlePasswordSave}>Save</Button>
        </Flex>
      </Flex>
    </Box>
  )
}

export default Security
