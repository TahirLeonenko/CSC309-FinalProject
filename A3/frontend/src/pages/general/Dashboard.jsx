import React, { createContext, useEffect, useState } from 'react'
import { Box, Grid, LoadingOverlay, Notification } from '@mantine/core'
import { Outlet, useLocation, useNavigate } from 'react-router'
import Navbar from './Navbar'
import { QueryCache, useMutation, useQueryClient } from '@tanstack/react-query'
import { validateToken } from '../../utils/client'

export const NotificationContext = createContext()

function Dashboard() {
  const [notificationTitle, setNotificationTitle] = useState('')
  const [notificationText, setNotificationText] = useState('')
  const [notificationColor, setNotificationColor] = useState('blue')
  const [isShowingNotification, setIsShowingNotification] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()

  const {
    mutate: validate,
    data,
    isPending,
  } = useMutation({
    mutationFn: validateToken,
    mutationKey: ['validated'],
    onError: (d) => {
      queryClient.clear()
      localStorage.removeItem('access_token')
      localStorage.removeItem('userid')
      localStorage.removeItem('role')
      navigate('/login')
    },
  })

  const triggerNotification = (title, text, color = 'blue') => {
    setIsShowingNotification(true)
    setNotificationText(text)
    setNotificationTitle(title)
    setNotificationColor(color)

    setTimeout(() => {
      setIsShowingNotification(false)
    }, 3000)
  }

  useEffect(() => {
    validate()
  }, [location])

  return (
    <>
      <LoadingOverlay visible={isPending} w={'100vw'} h="100vh" pos={'absolute'} top={0} left={0} />
      <NotificationContext.Provider value={{ triggerNotification }}>
        <Grid w="100vw" overflow="hidden">
          {isShowingNotification && (
            <Notification
              pos={'absolute'}
              title={notificationTitle}
              top={'2rem'}
              right={'2rem'}
              withBorder
              color={notificationColor}
              onClose={() => setIsShowingNotification(false)}
              style={{ zIndex: 1001 }}>
              {notificationText}
            </Notification>
          )}
          <Grid.Col span={3}>
            <Navbar />
          </Grid.Col>
          <Grid.Col span={9}>
            <Outlet />
          </Grid.Col>
        </Grid>
      </NotificationContext.Provider>
    </>
  )
}

export default Dashboard
