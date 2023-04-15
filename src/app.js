// Import dependecies
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'
import express from 'express'
import expressSession from 'express-session'
import bodyParser from 'body-parser'
import { createRouter } from './routers/create.js'
import { indexRouter } from './routers/index.js'
import { joinRouter } from './routers/join.js'

export const app = express()

// Generate random session key and jwt secret
if (!process.env.hasOwnProperty('POP_CHAT_JWT_SECRET')) {
  process.env['POP_CHAT_JWT_SECRET'] = crypto.randomBytes(32).toString('hex')
}
if (!process.env.hasOwnProperty('POP_CHAT_SESSION_SECRET_KEY')) {
  process.env['POP_CHAT_SESSION_SECRET_KEY'] = crypto.randomBytes(32).toString('hex')
}

// Define paths and envs for Express config
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const publicDirectoryPath = path.join(__dirname, '../public')
const viewsPath = path.join(__dirname, '../views')

// Setup handlebars engine amd views loction
app.set('view engine', 'hbs')
app.set('views', viewsPath)

// Set up static directory
app.use(express.static(publicDirectoryPath))
app.use(bodyParser.json())

// Set up parser
app.use(bodyParser.urlencoded({ extended: true }))
app.use(expressSession({
  secret: process.env.POP_CHAT_SESSION_SECRET_KEY,
  saveUninitialized: false,
  resave: false,
  cookie: { secure: true, maxAge: 3600000 },
}))

app.use(joinRouter)
app.use(createRouter)
app.use(indexRouter)
