require('dotenv').config()
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const createServer = require('./createServer')
const db = require('./db')

const server = createServer()
server.express.use(cookieParser())

server.express.use((req, res, next) => {
  const { token } = req.cookies
  if (token) {
    const { userId } = jwt.verify(token, process.env.APP_SECRET)
    req.userId = userId
  }
  next()
})

server.express.use(async (req, res, next) => {
  if (!req.userId) return next()
  const currentUser = await db.query.user(
    { where: { id: req.userId } },
    '{ id, permissions, email, name }'
  )

  req.user = currentUser
  next()
})

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
