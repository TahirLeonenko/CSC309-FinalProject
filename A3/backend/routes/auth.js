const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { v4: uuidv4 } = require('uuid')
const { jwtAuth } = require('../middleware/token_auth')

const SECRET_KEY = 'secretkey'
const lastResetRequests = {}

router.post('/tokens', async (req, res) => {
  const { utorid, password } = req.body

  if (!utorid || !password) {
    return res.status(400).json({ error: 'Missing required fields: utorid and password' })
  }
  const user = await prisma.user.findUnique({ where: { utorid } })
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: user not found' })
  }

  if (user.password !== password) {
    return res.status(401).json({ error: 'Unauthorized: password incorrect' })
  }

  const expiresInSeconds = 3600 // 1 hour
  const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, {
    expiresIn: expiresInSeconds,
  })

  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString()
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  })
  return res.json({
    token,
    expiresAt,
  })
})

router.post('/tokens/validate', jwtAuth, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ validated: false, error: 'Not authenticated.' })
  }

  return res.json({ validated: true, user: req.user })
})

router.post('/resets', async (req, res) => {
  const { utorid } = req.body
  if (!utorid) {
    return res.status(400).json({ error: 'Missing required field: utorid' })
  }

  const user = await prisma.user.findUnique({
    where: { utorid },
  })

  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }
  if (user) {
    const resetToken = uuidv4()
    // Expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        expiresAt,
      },
    })

    // Rate limiting by client IP
    const clientIp = req.ip
    const now = Date.now()
    if (!lastResetRequests[clientIp]) {
      lastResetRequests[clientIp] = now
    } else {
      const timeSinceLastRequest = now - lastResetRequests[clientIp]
      if (timeSinceLastRequest < 60000) {
        return res.status(429).json({ error: 'Too many requests' })
      }
      lastResetRequests[clientIp] = now
    }

    return res.status(202).json({
      expiresAt: expiresAt.toISOString(),
      resetToken,
    })
  }
})

router.post('/resets/:resetToken', async (req, res) => {
  const { resetToken } = req.params
  const { utorid, password } = req.body

  // Validate required fields
  if (!utorid || !password) {
    return res.status(400).json({ error: 'Missing required fields: utorid and password' })
  }

  // Validate password: 8-20 chars, uppercase, lowercase, digit, special char
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,20}$/
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error:
        'Password must be 8-20 characters with uppercase, lowercase, number, and special character',
    })
  }

  const user = await prisma.user.findFirst({
    where: {
      resetToken,
    },
  })
  // If no user found, return 404
  if (!user) {
    return res.status(404).json({ error: 'Reset token not found' })
  }

  if (user.utorid !== utorid) {
    return res.status(401).json({ error: 'Unauthorized: utorid does not match' })
  }

  // Check token expiration
  if (user.expiresAt && user.expiresAt < new Date()) {
    return res.status(410).json({ error: 'Reset token expired' })
  }

  // Token is valid – update password, clear reset fields
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password,
      resetToken: null,
      expiresAt: null,
    },
  })

  return res.status(200).json({ message: 'Password reset successful' })
})
module.exports = router
