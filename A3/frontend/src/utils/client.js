// API endpoints here
const BE_URL = process.env.REACT_APP_BACKEND_URL

// Auth
export const validateToken = async () => {
  const token = localStorage.getItem('access_token')

  const url = BE_URL + 'auth/tokens/validate'

  const headers = {
    Authorization: `Bearer ${token}`,
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
  })

  if (!response.ok) {
    throw new Error('Failed to get validate')
  }

  const data = await response.json()

  return data
}

// User endpoints
export const getUserTransactions = async (query = new URLSearchParams()) => {
  const token = localStorage.getItem('access_token')

  const url = BE_URL + 'users/me/transactions?' + query.toString()

  const headers = {
    Authorization: `Bearer ${token}`,
  }

  const response = await fetch(url, {
    method: 'GET',
    headers,
  })

  if (!response.ok) {
    throw new Error('Failed to get transactions')
  }

  const data = await response.json()

  return data
}

export const createTransfer = async (userId, amount, remark) => {
  const token = localStorage.getItem('access_token')

  const url = BE_URL + `users/${userId}/transactions`

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }

  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ type: 'transfer', amount, remark }),
    headers,
  })

  if (!response.ok) {
    throw new Error('Failed to create transfer')
  }

  const data = await response.json()

  return data
}

export const createRedemption = async (amount, remark) => {
  const token = localStorage.getItem('access_token')

  const url = BE_URL + `users/me/transactions`

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': `application/json`,
  }

  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({ type: 'redemption', amount, remark }),
    headers,
  })

  if (!response.ok) {
    throw new Error('Failed to create redemption')
  }

  const data = await response.json()

  return data
}

export const getUserInformation = async () => {
  const token = localStorage.getItem('access_token')

  const url = BE_URL + `users/me`

  const headers = {
    Authorization: `Bearer ${token}`,
  }

  const response = await fetch(url, {
    method: 'GET',
    headers,
  })

  if (!response.ok) {
    throw new Error('Failed to get user data')
  }

  const data = await response.json()

  return data
}

export const patchUserInformation = async (body) => {
  const token = localStorage.getItem('access_token')

  const url = BE_URL + `users/me`

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': `application/json`,
  }

  const response = await fetch(url, {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers,
  })

  if (!response.ok) {
    throw new Error(response.json().error)
  }

  const data = await response.json()

  return data
}

export const changePassword = async (oldPassword, newPassword) => {
  const token = localStorage.getItem('access_token')

  const url = BE_URL + `users/me/password`

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': `application/json`,
  }

  const response = await fetch(url, {
    method: 'PATCH',
    body: JSON.stringify({ old: oldPassword, new: newPassword }),
    headers,
  })

  if (!response.ok) {
    throw new Error(response.json().error)
  }

  const data = await response.json()

  return data
}

// Promotions
export const getPromotions = async (query = new URLSearchParams()) => {
  const token = localStorage.getItem('access_token')

  const url = BE_URL + `promotions?` + query.toString()

  const headers = {
    Authorization: `Bearer ${token}`,
  }

  const response = await fetch(url, {
    method: 'GET',
    headers,
  })

  if (!response.ok) {
    throw new Error('Failed to get promotions')
  }

  const data = await response.json()

  return data
}

// Events
export const getEvents = async (query = new URLSearchParams()) => {
  const token = localStorage.getItem('access_token')

  const url = BE_URL + `events?` + query.toString()

  const headers = {
    Authorization: `Bearer ${token}`,
  }

  const response = await fetch(url, {
    method: 'GET',
    headers,
  })

  if (!response.ok) {
    throw new Error('Failed to get events')
  }

  const data = await response.json()

  return data
}

export const getSingleEvent = async (eventId) => {
  const token = localStorage.getItem('access_token')

  const url = BE_URL + `events/${eventId}`

  const headers = {
    Authorization: `Bearer ${token}`,
  }

  const response = await fetch(url, {
    method: 'GET',
    headers,
  })

  if (!response.ok) {
    throw new Error(`Failed to get event ${eventId}`)
  }

  const data = await response.json()

  return data
}

export const rsvpEvent = async (eventId) => {
  const token = localStorage.getItem('access_token')

  const url = BE_URL + `events/${eventId}/guests/me`

  const headers = {
    Authorization: `Bearer ${token}`,
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
  })

  if (!response.ok) {
    throw new Error(`Failed to RSVP to event ${eventId}`)
  }

  const data = await response.json()

  return data
}

export const unrsvpEvent = async (eventId) => {
  const token = localStorage.getItem('access_token')

  const url = BE_URL + `events/${eventId}/guests/me`

  const headers = {
    Authorization: `Bearer ${token}`,
  }

  const response = await fetch(url, {
    method: 'DELETE',
    headers,
  })

  if (!response.ok) {
    throw new Error(`Failed to un-RSVP from event ${eventId}`)
  }

  return true
}
