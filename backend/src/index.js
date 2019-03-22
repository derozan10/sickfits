// let's go!
require('dotenv').config()
const createServer = require('./createServer')
const db = require('./db')

const server = createServer()

server.start(
  {
    cors: {
      credentials: true,
      origin: process.env.FRONTEND_URL,
    },
  },
  deets => {
    console.log(`server is running on port http://localhost:${deets.port}`)
  }
)
