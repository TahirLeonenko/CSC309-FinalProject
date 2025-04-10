const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { jwtAuth } = require('../middleware/token_auth')

router.post('/', jwtAuth, async (req, res) => {
  if (req.clearance < 1) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  if (req.clearance < 3) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  const { name, description, location, startTime, endTime, capacity, points } = req.body
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Name is required and must be a string' })
  }
  if (!description || typeof description !== 'string') {
    return res.status(400).json({ error: 'Description is required and must be a string' })
  }
  if (!location || typeof location !== 'string') {
    return res.status(400).json({ error: 'Location is required and must be a string' })
  }
  if (!startTime || typeof startTime !== 'string') {
    return res.status(400).json({ error: 'Start time is required and must be a string' })
  }
  if (!endTime || typeof endTime !== 'string') {
    return res.status(400).json({ error: 'End time is required and must be a string' })
  }
  const start = new Date(startTime)
  const end = new Date(endTime)
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return res.status(400).json({ error: 'Start time and end time must be in ISO 8601 format' })
  }
  if (start >= end) {
    return res.status(400).json({ error: 'End time must be after start time' })
  }
  if (
    capacity !== undefined &&
    capacity !== null &&
    (typeof capacity !== 'number' || capacity <= 0)
  ) {
    return res.status(400).json({ error: 'Capacity must be a positive number or null' })
  }
  if (
    points === undefined ||
    points === null ||
    typeof points !== 'number' ||
    points <= 0 ||
    !Number.isInteger(points)
  ) {
    return res.status(400).json({ error: 'Points must be a positive integer' })
  }
  const event = await prisma.event.create({
    data: {
      name,
      description,
      location,
      startTime: start,
      endTime: end,
      capacity,
      pointsRemain: points,
      pointsAwarded: 0,
      published: false,
      organizers: { connect: [] },
      guests: { connect: [] },
    },
  })
  return res.status(201).json({
    id: event.id,
    name: event.name,
    description: event.description,
    location: event.location,
    startTime: event.startTime.toISOString(),
    endTime: event.endTime.toISOString(),
    capacity: event.capacity,
    pointsRemain: event.pointsRemain,
    pointsAwarded: event.pointsAwarded,
    published: event.published,
    organizers: [],
    guests: [],
  })
})

router.get('/', jwtAuth, async (req, res) => {
  if (req.clearance < 1) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  let { name, location, started, ended, showFull, published, page, limit } = req.query
  if (page !== undefined && page !== null) {
    page = parseInt(page, 10)
    if (isNaN(page) || page < 1) {
      return res.status(400).json({ error: 'Invalid page number' })
    }
  }

  if (limit !== undefined && limit !== null) {
    limit = parseInt(limit, 10)
    if (isNaN(limit) || limit < 1) {
      return res.status(400).json({ error: 'Invalid limit number' })
    }
  }

  if (page === undefined || page === null) {
    page = 1
  }
  if (limit === undefined || limit === null) {
    limit = 10
  }
  if (started === 'true') {
    started = true
  } else if (started === 'false') {
    started = false
  } else if (started === undefined) {
    started = null
  }
  if (ended === 'true') {
    ended = true
  } else if (ended === 'false') {
    ended = false
  } else if (ended === undefined) {
    ended = null
  }
  if (started !== null && ended !== null) {
    return res.status(400).json({ error: 'Cannot specify both started and ended' })
  }
  if (typeof started !== 'boolean' && started !== null) {
    return res.status(400).json({ error: 'Started must be a boolean' })
  }
  if (typeof ended !== 'boolean' && ended !== null) {
    return res.status(400).json({ error: 'Ended must be a boolean' })
  }
  if (showFull === 'true') {
    showFull = true
  } else if (showFull === 'false') {
    showFull = false
  } else if (showFull === undefined) {
    showFull = null
  }
  if (typeof showFull !== 'boolean' && showFull !== null) {
    return res.status(400).json({ error: 'ShowFull must be a boolean' })
  }
  if (showFull === null) {
    showFull = false
  }
  const where = {}
  if (name !== undefined && name !== null && typeof name !== 'string') {
    return res.status(400).json({ error: 'Name must be a string' })
  }
  if (location !== undefined && location !== null && typeof location !== 'string') {
    return res.status(400).json({ error: 'Location must be a string' })
  }
  if (name) where.name = { contains: name }
  if (location) where.location = { contains: location }
  const now = new Date()
  if (started !== null) {
    where.startTime = started ? { lte: now } : { gt: now }
  }
  if (ended !== null) {
    where.endTime = ended ? { lte: now } : { gt: now }
  }

  if (req.clearance >= 3) {
    if (published === 'true') {
      published = true
    } else if (published === 'false') {
      published = false
    } else if (published === undefined) {
      published = null
    }
    if (typeof published !== 'boolean' && published !== null) {
      return res.status(400).json({ error: 'Published must be a boolean' })
    }
    if (published !== null) {
      where.published = published
    }
  } else {
    where.published = true
  }
  // Fetch events
  const events = await prisma.event.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    include: {
      _count: {
        select: {
          guests: true,
        },
      },
    },
  })

  let filteredEvents = events
  if (!showFull) {
    filteredEvents = events.filter((e) => e.capacity === null || e.capacity > e._count.guests)
  }
  const count = await prisma.event.count({ where })
  const results = filteredEvents.map((e) => {
    const eventData = {
      id: e.id,
      name: e.name,
      location: e.location,
      startTime: e.startTime.toISOString(),
      endTime: e.endTime.toISOString(),
      capacity: e.capacity,
      numGuests: e._count.guests,
    }
    if (req.clearance >= 3) {
      eventData.pointsRemain = e.pointsRemain
      eventData.pointsAwarded = e.pointsAwarded
      eventData.published = e.published
    }
    return eventData
  })
  return res.status(200).json({ count, results })
})

router.post('/:eventId/organizers', jwtAuth, async (req, res) => {
  if (req.clearance < 3) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  const eventId = parseInt(req.params.eventId)
  if (isNaN(eventId)) {
    return res.status(400).json({ error: 'Invalid event ID' })
  }
  const { utorid } = req.body
  if (!utorid || typeof utorid !== 'string') {
    return res.status(400).json({ error: 'UTORid is required and must be a string' })
  }
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { guests: true },
  })
  if (!event) {
    return res.status(404).json({ error: 'Event not found' })
  }
  if (event.endTime < new Date()) {
    return res.status(410).json({ error: 'Event has ended' })
  }
  const user = await prisma.user.findUnique({ where: { utorid } })
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }
  if (event.guests.some((g) => g.id === user.id)) {
    return res.status(400).json({ error: 'User is already a guest' })
  }
  const updatedEvent = await prisma.event.update({
    where: { id: eventId },
    data: { organizers: { connect: { id: user.id } } },
    include: { organizers: { select: { id: true, utorid: true, name: true } } },
  })
  return res.status(201).json({
    id: updatedEvent.id,
    name: updatedEvent.name,
    location: updatedEvent.location,
    organizers: updatedEvent.organizers,
  })
})

router.delete('/:eventId/organizers/:userId', jwtAuth, async (req, res) => {
  if (req.clearance < 3) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  const eventId = parseInt(req.params.eventId)
  const userId = parseInt(req.params.userId)
  if (isNaN(eventId) || isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid event ID or user ID' })
  }
  const event = await prisma.event.findUnique({ where: { id: eventId } })
  if (!event) {
    return res.status(404).json({ error: 'Event not found' })
  }
  await prisma.event.update({
    where: { id: eventId },
    data: { organizers: { disconnect: { id: userId } } },
  })
  return res.status(204).send()
})

router.post('/:eventId/guests', jwtAuth, async (req, res) => {
  const eventId = parseInt(req.params.eventId)
  if (isNaN(eventId)) {
    return res.status(400).json({ error: 'Invalid event ID' })
  }
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { organizers: true, guests: true, _count: { select: { guests: true } } },
  })
  if (!event) {
    return res.status(404).json({ error: 'Event not found' })
  }
  const isOrganizer = event.organizers.some((o) => o.id === req.user.id)
  if (req.clearance < 3 && !isOrganizer) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  if (!event.published && req.clearance < 3) {
    return res.status(404).json({ error: 'Event not found' })
  }
  const { utorid } = req.body
  if (!utorid || typeof utorid !== 'string') {
    return res.status(400).json({ error: 'UTORid is required and must be a string' })
  }
  const user = await prisma.user.findUnique({ where: { utorid } })
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }
  if (event.organizers.some((o) => o.id === user.id)) {
    return res.status(400).json({ error: 'User is an organizer' })
  }
  if (event.guests.some((g) => g.id === user.id)) {
    return res.status(400).json({ error: 'User is already a guest' })
  }
  if (event.capacity !== null && event._count.guests >= event.capacity) {
    return res.status(410).json({ error: 'Event is full' })
  }
  if (event.endTime < new Date()) {
    return res.status(410).json({ error: 'Event has ended' })
  }
  const updatedEvent = await prisma.event.update({
    where: { id: eventId },
    data: { guests: { connect: { id: user.id } } },
    include: { guests: { select: { id: true, utorid: true, name: true } } },
  })
  return res.status(201).json({
    id: updatedEvent.id,
    name: updatedEvent.name,
    location: updatedEvent.location,
    guestAdded: { id: user.id, utorid: user.utorid, name: user.name },
    numGuests: updatedEvent.guests.length,
  })
})
router.post('/:eventId/guests/me', jwtAuth, async (req, res) => {
  if (req.clearance < 1) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const eventId = parseInt(req.params.eventId)
  if (isNaN(eventId)) {
    return res.status(400).json({ error: 'Invalid event ID' })
  }
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { guests: true, _count: { select: { guests: true } } },
  })
  if (!event) {
    return res.status(404).json({ error: 'Event not found' })
  }
  if (!event.published) {
    return res.status(404).json({ error: 'Event not found' })
  }
  if (event.guests.some((g) => g.id === req.user.id)) {
    return res.status(400).json({ error: 'User is already a guest' })
  }
  if (event.capacity !== null && event._count.guests >= event.capacity) {
    return res.status(410).json({ error: 'Event is full' })
  }
  if (event.endTime < new Date()) {
    return res.status(410).json({ error: 'Event has ended' })
  }
  const updatedEvent = await prisma.event.update({
    where: { id: eventId },
    data: { guests: { connect: { id: req.user.id } } },
    include: { guests: { select: { id: true, utorid: true, name: true } } },
  })
  return res.status(201).json({
    id: updatedEvent.id,
    name: updatedEvent.name,
    location: updatedEvent.location,
    guestAdded: { id: req.user.id, utorid: req.user.utorid, name: req.user.name },
    numGuests: updatedEvent.guests.length,
  })
})

router.delete('/:eventId/guests/me', jwtAuth, async (req, res) => {
  if (req.clearance < 1) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const eventId = parseInt(req.params.eventId)
  if (isNaN(eventId)) {
    return res.status(400).json({ error: 'Invalid event ID' })
  }
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { guests: true },
  })
  if (!event) {
    return res.status(404).json({ error: 'Event not found' })
  }
  if (!event.guests.some((g) => g.id === req.user.id)) {
    return res.status(404).json({ error: 'User is not a guest' })
  }
  if (event.endTime < new Date()) {
    return res.status(410).json({ error: 'Event has ended' })
  }
  await prisma.event.update({
    where: { id: eventId },
    data: { guests: { disconnect: { id: req.user.id } } },
  })
  return res.status(204).send()
})

router.delete('/:eventId/guests/:userId', jwtAuth, async (req, res) => {
  if (req.clearance < 3) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  const eventId = parseInt(req.params.eventId)
  const userId = parseInt(req.params.userId)
  if (isNaN(eventId) || isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid event ID or user ID' })
  }
  const event = await prisma.event.findUnique({ where: { id: eventId } })
  if (!event) {
    return res.status(404).json({ error: 'Event not found' })
  }
  await prisma.event.update({
    where: { id: eventId },
    data: { guests: { disconnect: { id: userId } } },
  })
  return res.status(204).send()
})

router.post('/:eventId/transactions', jwtAuth, async (req, res) => {
  const eventId = parseInt(req.params.eventId)
  if (isNaN(eventId)) {
    return res.status(400).json({ error: 'Invalid event ID' })
  }
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { organizers: true, guests: true },
  })
  if (!event) {
    return res.status(404).json({ error: 'Event not found' })
  }
  const isOrganizer = event.organizers.some((o) => o.id === req.user.id)
  if (req.clearance < 3 && !isOrganizer) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  const { type, utorid, amount } = req.body
  if (!type || type !== 'event') {
    return res.status(400).json({ error: 'Type must be "event"' })
  }
  if (!amount || typeof amount !== 'number' || amount <= 0 || !Number.isInteger(amount)) {
    return res.status(400).json({ error: 'Amount must be a positive integer' })
  }
  if (event.pointsRemain < amount) {
    return res.status(400).json({ error: 'Insufficient points remaining' })
  }
  let recipients = []
  if (utorid !== undefined && utorid !== null) {
    if (typeof utorid !== 'string') {
      return res.status(400).json({ error: 'UTORid must be a string' })
    }
    const user = await prisma.user.findUnique({ where: { utorid } })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    if (!event.guests.some((g) => g.id === user.id)) {
      return res.status(400).json({ error: 'User is not a guest' })
    }
    recipients = [user]
  } else {
    recipients = event.guests
  }
  const transactions = []
  for (const recipient of recipients) {
    const transaction = await prisma.transaction.create({
      data: {
        type: 'EVENT',
        points: amount,
        remark: req.body.remark,
        userId: recipient.id,
        createdById: req.user.id,
        eventId: event.id,
      },
    })
    await prisma.user.update({
      where: { id: recipient.id },
      data: { points: { increment: amount } },
    })
    transactions.push({
      id: transaction.id,
      recipient: recipient.utorid,
      awarded: amount,
      type: 'event',
      relatedId: event.id,
      remark: transaction.remark || '',
      createdBy: req.user.utorid,
    })
  }
  await prisma.event.update({
    where: { id: eventId },
    data: {
      pointsRemain: { decrement: amount * recipients.length },
      pointsAwarded: { increment: amount * recipients.length },
    },
  })
  if (utorid) {
    return res.status(201).json(transactions[0])
  } else {
    return res.status(201).json(transactions)
  }
})

module.exports = router

router.get('/:eventId', jwtAuth, async (req, res) => {
  if (req.clearance < 1) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const eventId = parseInt(req.params.eventId)
  if (isNaN(eventId)) {
    return res.status(400).json({ error: 'Invalid event ID' })
  }
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      organizers: { select: { id: true, utorid: true, name: true } },
      guests: { select: { id: true, utorid: true, name: true } },
      _count: { select: { guests: true } },
    },
  })
  if (!event) {
    return res.status(404).json({ error: 'Event not found' })
  }
  const rsvp = !!event.guests.find((g) => g.id === req.user.id)
  const isOrganizer = event.organizers.some((o) => o.id === req.user.id)
  if (req.clearance >= 3 || isOrganizer) {
    return res.status(200).json({
      id: event.id,
      name: event.name,
      description: event.description,
      location: event.location,
      startTime: event.startTime.toISOString(),
      endTime: event.endTime.toISOString(),
      capacity: event.capacity,
      pointsRemain: event.pointsRemain,
      pointsAwarded: event.pointsAwarded,
      published: event.published,
      organizers: event.organizers,
      guests: event.guests,
      rsvp,
    })
  } else {
    if (!event.published) {
      return res.status(404).json({ error: 'Event not found' })
    }
    return res.status(200).json({
      id: event.id,
      name: event.name,
      description: event.description,
      location: event.location,
      startTime: event.startTime.toISOString(),
      endTime: event.endTime.toISOString(),
      capacity: event.capacity,
      organizers: event.organizers,
      numGuests: event._count.guests,
      rsvp,
    })
  }
})

router.patch('/:eventId', jwtAuth, async (req, res) => {
  if (req.clearance < 1) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const eventId = parseInt(req.params.eventId)
  if (isNaN(eventId)) {
    return res.status(400).json({ error: 'Invalid event ID' })
  }
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { organizers: true, _count: { select: { guests: true } } },
  })
  if (!event) {
    return res.status(404).json({ error: 'Event not found' })
  }
  const isOrganizer = event.organizers.some((o) => o.id === req.user.id)
  if (req.clearance < 3 && !isOrganizer) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  let { name, description, location, startTime, endTime, capacity, points, published } = req.body
  const changes = {}
  const now = new Date()
  if (name !== undefined && name !== null) {
    if (typeof name !== 'string') {
      return res.status(400).json({ error: 'Name must be a string' })
    }
    if (event.startTime < now) {
      return res.status(400).json({ error: 'Cannot update name after start time' })
    }
    changes.name = name
  }
  if (description !== undefined && description !== null) {
    if (typeof description !== 'string') {
      return res.status(400).json({ error: 'Description must be a string' })
    }
    if (event.startTime < now) {
      return res.status(400).json({ error: 'Cannot update description after start time' })
    }
    changes.description = description
  }
  if (location !== undefined && location !== null) {
    if (typeof location !== 'string') {
      return res.status(400).json({ error: 'Location must be a string' })
    }
    if (event.startTime < now) {
      return res.status(400).json({ error: 'Cannot update location after start time' })
    }
    changes.location = location
  }
  if (startTime !== undefined && startTime !== null) {
    if (typeof startTime !== 'string') {
      return res.status(400).json({ error: 'Start time must be a string' })
    }
    const newStart = new Date(startTime)
    if (isNaN(newStart.getTime())) {
      return res.status(400).json({ error: 'Start time must be in ISO 8601 format' })
    }
    if (newStart < now) {
      return res.status(400).json({ error: 'Start time cannot be in the past' })
    }
    if (event.startTime < now) {
      return res.status(400).json({ error: 'Cannot update start time after original start time' })
    }
    changes.startTime = newStart
  }
  if (endTime !== undefined && endTime !== null) {
    if (typeof endTime !== 'string') {
      return res.status(400).json({ error: 'End time must be a string' })
    }
    const newEnd = new Date(endTime)
    if (isNaN(newEnd.getTime())) {
      return res.status(400).json({ error: 'End time must be in ISO 8601 format' })
    }
    if (newEnd < now) {
      return res.status(400).json({ error: 'End time cannot be in the past' })
    }
    if (event.endTime < now) {
      return res.status(400).json({ error: 'Cannot update end time after original end time' })
    }
    changes.endTime = newEnd
  }
  if (capacity !== undefined) {
    if (capacity !== null) {
      if (typeof capacity !== 'number' || capacity <= 0) {
        return res.status(400).json({ error: 'Capacity must be a positive number' })
      }
      if (event.startTime < now) {
        return res.status(400).json({ error: 'Cannot update capacity after start time' })
      }
      if (capacity < event._count.guests) {
        return res
          .status(400)
          .json({ error: 'Capacity cannot be less than current number of guests' })
      }
      changes.capacity = capacity
    }
  }
  if (points !== undefined && points !== null) {
    if (req.clearance < 3) {
      return res.status(403).json({ error: 'Only managers can update points' })
    }
    if (typeof points !== 'number' || points <= 0 || !Number.isInteger(points)) {
      return res.status(400).json({ error: 'Points must be a positive integer' })
    }
    if (points < event.pointsAwarded) {
      return res.status(400).json({ error: 'Cannot reduce points below awarded points' })
    }
    changes.pointsRemain = points - event.pointsAwarded
  }
  if (published !== undefined && published !== null) {
    if (req.clearance < 3) {
      return res.status(403).json({ error: 'Only managers can update published status' })
    }
    if (published === 'true') {
      published = true
    } else if (published === 'false') {
      published = false
    } else if (published === undefined) {
      published = null
    }
    if (typeof published !== 'boolean' && published !== null) {
      return res.status(400).json({ error: 'Published must be a boolean' })
    }
    if (published) {
      changes.published = true
    }
  }
  if (Object.keys(changes).length === 0) {
    return res.status(400).json({ error: 'No changes provided' })
  }
  const updatedEvent = await prisma.event.update({
    where: { id: eventId },
    data: changes,
  })
  const response = { id: updatedEvent.id, name: updatedEvent.name, location: updatedEvent.location }
  if ('description' in changes) response.description = changes.description
  if ('startTime' in changes) response.startTime = changes.startTime.toISOString()
  if ('endTime' in changes) response.endTime = changes.endTime.toISOString()
  if ('capacity' in changes) response.capacity = changes.capacity
  if ('pointsRemain' in changes) response.pointsRemain = changes.pointsRemain
  if ('published' in changes) response.published = changes.published
  return res.status(200).json(response)
})

router.delete('/:eventId', jwtAuth, async (req, res) => {
  if (req.clearance < 3) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  const eventId = parseInt(req.params.eventId)
  if (isNaN(eventId)) {
    return res.status(400).json({ error: 'Invalid event ID' })
  }
  const event = await prisma.event.findUnique({ where: { id: eventId } })
  if (!event) {
    return res.status(404).json({ error: 'Event not found' })
  }
  if (event.published) {
    return res.status(400).json({ error: 'Cannot delete published event' })
  }
  await prisma.event.delete({ where: { id: eventId } })
  return res.status(204).send()
})
