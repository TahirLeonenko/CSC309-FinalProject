#!/usr/bin/env node
'use strict'

const port = (() => {
  const args = process.argv

  if (args.length !== 3) {
    console.error('usage: node index.js port')
    process.exit(1)
  }

  const num = parseInt(args[2], 10)
  if (isNaN(num)) {
    console.error('error: argument must be an integer.')
    process.exit(1)
  }

  return num
})()

const express = require('express')
const app = express()

app.use(express.json())

// ADD YOUR WORK HERE
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const usersRouter = require('./routes/user')
const authRouter = require('./routes/auth')
const transactionRouter = require('./routes/transactions')
const eventsRouter = require('./routes/events')
const promotionsRouter = require('./routes/promotions')

const cors = require('cors')

// Add CORS middleware before any routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://frontend-production-dcda.up.railway.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Also keep the cors middleware for additional configuration
app.use(cors({
  origin: 'https://frontend-production-dcda.up.railway.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use('/users', usersRouter)
app.use('/auth', authRouter)
app.use('/transactions', transactionRouter)
app.use('/events', eventsRouter)
app.use('/promotions', promotionsRouter)

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})

server.on('error', (err) => {
  console.error(`cannot start server: ${err.message}`)
  process.exit(1)
})
